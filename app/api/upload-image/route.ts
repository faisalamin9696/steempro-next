import { NextRequest, NextResponse } from "next/server";
import { Constants } from "@/constants";
import got from "got";
import FormData from "form-data";

/**
 * Same-origin proxy for image-server uploads.
 *
 * The image server (steemitimages.com) only returns CORS headers for its own
 * origin allowlist (steemit.com) — any other origin, including steempro.com
 * and localhost, gets a preflight without `Access-Control-Allow-*`, so the
 * browser killed the XHR with a generic "Network error". Posting here keeps
 * the browser request same-origin; the server forwards it to the configured
 * image server, where CORS no longer applies.
 *
 * `server` is client-supplied (user setting) → strictly validated against the
 * allowlist to keep this from becoming an SSRF proxy.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const username = String(form.get("username") ?? "");
    const signature = String(form.get("signature") ?? "");
    const server = String(form.get("server") ?? "");

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json(
        { message: "No file in request" },
        { status: 400 },
      );
    }
    if (!username || !signature) {
      return NextResponse.json(
        { message: "Missing username or signature" },
        { status: 400 },
      );
    }
    if (!Constants.image_servers.includes(server)) {
      return NextResponse.json(
        { message: "Unknown image server" },
        { status: 400 },
      );
    }

    const sanitizedFilename = file.name.replace(/[()\s]/g, "_");
    const upstream = new FormData();
    upstream.append("file", Buffer.from(await file.arrayBuffer()), {
      filename: sanitizedFilename,
      contentType: file.type || "application/octet-stream",
    });

    // Forward verbatim (same path shape, Authorization value and body the
    // direct browser call used) and pass the upstream status/body through —
    // the client already interprets both success and error payloads.
    const res = await got.post(`${server}/${username}/${signature}`, {
      body: upstream,
      headers: {
        Authorization: server,
        ...upstream.getHeaders(),
      },
      responseType: "text",
      timeout: { request: 60000 },
      throwHttpErrors: false,
    });

    return new NextResponse(res.body, {
      status: res.statusCode,
      headers: {
        "Content-Type": res.headers["content-type"] || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Image upload proxy error:", error?.message || error);
    return NextResponse.json(
      { message: "Image upload failed" },
      { status: 502 },
    );
  }
}
