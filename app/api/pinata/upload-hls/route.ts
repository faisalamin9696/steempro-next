import { NextRequest, NextResponse } from "next/server";
import { Constants } from "@/constants";
import got from "got";
import FormData from "form-data";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to push SSE updates
      const send = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        // --- Phase 1: Parse Incoming Data ---
        const requestFormData = await request.formData();
        const files = requestFormData.getAll("files") as unknown as File[];
        const username =
          (requestFormData.get("username") as string) || "anonymous";

        if (!files.length) {
          send("error", { message: "No files found in request" });
          controller.close();
          return;
        }

        // --- Phase 2: Build Multi-part Form for Pinata ---
        const form = new FormData();
        const rootFolder = `hls_${username}_${Date.now()}`;

        // Convert each Web File to a Buffer and append with relative paths
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Crucial: Pinata needs 'filepath' to maintain the HLS folder structure
          // file.name usually looks like "720p/playlist.m3u8" or "master.m3u8"
          form.append("file", buffer, {
            filename: file.name,
            filepath: `${rootFolder}/${file.name}`,
            contentType: file.type || "application/octet-stream",
          });
        }

        // Add Pinata Metadata for the dashboard
        const metadata = JSON.stringify({
          name: rootFolder,
          keyvalues: {
            type: "hls-stream",
            username: username,
          },
        });
        form.append("pinataMetadata", metadata);

        // --- Phase 3: Execute Upload with Progress Tracking ---
        const pinataJWT = process.env.PINATA_JWT;
        if (!pinataJWT)
          throw new Error("Missing PINATA_JWT environment variable");

        const uploadRequest = got
          .post("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            body: form,
            headers: {
              Authorization: `Bearer ${pinataJWT}`,
              ...form.getHeaders(),
            },
            responseType: "json",
            timeout: {
              request: 600000, // 10 minutes for large video bundles
            },
          })
          .on("uploadProgress", (progress) => {
            // Calculate smooth percentage
            const percent = Math.round(progress.percent * 100);
            send("progress", {
              phase: "uploading",
              percent: percent,
              transferred: progress.transferred,
              total: progress.total,
            });
          });

        const response: any = await uploadRequest;
        const result = response.body;

        // --- Phase 4: Success Result ---
        send("progress", { phase: "done", percent: 100 });
        send("result", {
          cid: result.IpfsHash,
          url: `${Constants.ipfs_gateway}/ipfs/${result.IpfsHash}`,
          isHls: true,
          pinSize: result.PinSize,
        });
      } catch (error: any) {
        console.error("Pinata Upload Error:", error);

        // Extract the most helpful error message possible
        const errorMessage =
          error.response?.body?.error?.details ||
          error.response?.body?.error ||
          error.message ||
          "Internal Upload Error";

        send("error", { message: errorMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
