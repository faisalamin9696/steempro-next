"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { steemApi } from "@/libs/steem";
import { toBase64 } from "@/utils/helper";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import type {
  ProcessState,
  StageEntry,
  StageStatus,
} from "../../components/shorts/submit/types";

export function useShortsSubmit() {
  const router = useRouter();
  const { data: session } = useSession();
  const { authenticateOperation } = useAccountsContext();

  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [sizeInfo, setSizeInfo] = useState({ original: 0, compressed: 0 });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["shorts"]);
  const [tagInput, setTagInput] = useState("");
  const [videoCid, setVideoCid] = useState<string | null>(null);
  const [hlsBundle, setHlsBundle] = useState<{ blob: Blob; name: string }[]>(
    [],
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isProcessingThumbnail, setIsProcessingThumbnail] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(
    null,
  );
  const [stageLog, setStageLog] = useState<StageEntry[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [duration, setDuration] = useState(0);
  const [compressionMode, setCompressionMode] = useState<"normal" | "high">(
    "normal",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // --- Helpers ---
  const upsertStage = useCallback(
    (key: string, label: string, status: StageStatus, detail?: string) => {
      setStageLog((prev) => {
        const next = [...prev];
        const index = next.findIndex((item) => item.key === key);
        const stage = { key, label, detail, status };
        if (index >= 0) {
          next[index] = stage;
          return next;
        }
        return [...next, stage];
      });
    },
    [],
  );

  const resetState = useCallback(() => {
    setFile(null);
    setCompressedFile(null);
    setTitle("");
    setDescription("");
    setTags(["shorts"]);
    setTagInput("");
    setVideoCid("");
    setThumbnailUrl("");
    setThumbnailFile(null);
    setUploadProgress(null);
    setImageUploadProgress(null);
    setShowThumbnail(true);
    setProcessState("idle");
    setIsPublishing(false);
    setStageLog([]);
    setCompressionMode("normal");
    setSizeInfo({ original: 0, compressed: 0 });
    setActiveStep(1);
  }, []);

  // Object URLs
  const videoObjectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );
  const thumbObjectUrl = useMemo(
    () => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""),
    [thumbnailFile],
  );

  useEffect(
    () => () => {
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    },
    [videoObjectUrl],
  );
  useEffect(
    () => () => {
      if (thumbObjectUrl) URL.revokeObjectURL(thumbObjectUrl);
    },
    [thumbObjectUrl],
  );

  // --- Validation ---
  const validateVideoDimensions = (selectedFile: File): Promise<boolean> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const { videoWidth, videoHeight, duration } = video;
        if (videoHeight / videoWidth <= 1.1) {
          toast.error(
            `Invalid Dimensions: ${videoWidth}x${videoHeight}. Shorts must be vertical (9:16).`,
            { duration: 6000 },
          );
          return resolve(false);
        }
        setDuration(duration);
        if (duration > 60) {
          toast.info(
            `Video length (${Math.round(duration)}s) exceeds 60s. It will be automatically trimmed to the first 60 seconds.`,
            { duration: 6000 },
          );
        }
        resolve(true);
      };
      video.onerror = () => {
        toast.error("Could not read video metadata.");
        resolve(false);
      };
      video.src = URL.createObjectURL(selectedFile);
    });

  // --- File Change ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selected = e.target.files[0];

    // 8MB limit
    // if (selected.size > 8 * 1024 * 1024) {
    //   toast.error(
    //     `File too large (${(selected.size / (1024 * 1024)).toFixed(1)}MB). Max 8MB allowed for initial upload.`,
    //     { duration: 6000 },
    //   );
    //   e.target.value = "";
    //   return;
    // }

    upsertStage("validation", "Validating video", "active");
    const isValid = await validateVideoDimensions(selected);
    if (!isValid) {
      upsertStage(
        "validation",
        "Validating video",
        "error",
        "Video did not meet Shorts requirements.",
      );
      e.target.value = "";
      return;
    }
    upsertStage(
      "validation",
      "Validating video",
      "done",
      "Vertical format and duration approved.",
    );
    setFile(selected);
    await processAndUpload(selected);
  };

  // --- HLS Transcode ---
  const isProcessingRef = useRef(false);
  const processAndUpload = async (
    selectedFile: File,
    mode: "normal" | "high" = "normal",
  ) => {
    if (isProcessingRef.current) {
      console.warn(
        "Processing already in progress, skipping duplicate trigger.",
      );
      return;
    }
    isProcessingRef.current = true;
    setCompressionMode(mode);
    setProcessState("loading_ffmpeg");
    setUploadProgress(null);
    upsertStage("engine", "Setting up encoder", "active");
    let currentPass = 0; // 0 for 720p, 1 for 360p
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on("progress", ({ progress }) => {
        // Unify progress: 1st pass is 0-50%, 2nd pass is 50-100%
        const passOffset = currentPass * 50;
        let p = 0;
        if (typeof progress === "number" && isFinite(progress)) {
          p = Math.max(0, Math.min(1, progress));
        }
        const totalPercent = Math.round(passOffset + p * 50);

        setUploadProgress(totalPercent);
        upsertStage(
          "compress",
          currentPass === 0 ? "Encoding HQ" : "Optimizing Mobile",
          "active",
          `${totalPercent}% - ${currentPass === 0 ? "High Quality" : "Mobile Version"}`,
        );
      });
      await ffmpeg.load();
      upsertStage("engine", "Encoder ready", "done");
      setProcessState("compressing");
      await ffmpeg.writeFile("input.mp4", await fetchFile(selectedFile));

      upsertStage(
        "compress",
        "Encoding 720p HQ",
        "active",
        "Generating high-quality HLS stream...",
      );
      await ffmpeg.createDir("720p");
      await ffmpeg.createDir("360p");

      // 720p with 60s limit
      const preset = mode === "normal" ? "ultrafast" : "faster";
      const crf720 = mode === "normal" ? "30" : "28";
      const crf360 = mode === "normal" ? "36" : "34";

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-t",
        "60",
        "-vf",
        "scale=-2:720",
        "-c:v",
        "libx264",
        "-crf",
        crf720,
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-hls_time",
        "4",
        "-hls_list_size",
        "0",
        "-f",
        "hls",
        "720p/playlist.m3u8",
      ]);

      // 360p with 60s limit
      currentPass = 1;
      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-t",
        "60",
        "-vf",
        "scale=-2:360",
        "-c:v",
        "libx264",
        "-crf",
        crf360,
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-hls_time",
        "4",
        "-hls_list_size",
        "0",
        "-f",
        "hls",
        "360p/playlist.m3u8",
      ]);

      // Master playlist
      const masterM3U8 =
        "#EXTM3U\n#EXT-X-VERSION:3\n" +
        '#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=720x1280,NAME="720p"\n720p/playlist.m3u8\n' +
        '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=360x640,NAME="360p"\n360p/playlist.m3u8';
      await ffmpeg.writeFile("master.m3u8", masterM3U8);

      // Collect segments
      const bundle: { blob: Blob; name: string }[] = [];
      for (const folder of ["720p", "360p"]) {
        for (const entry of await ffmpeg.listDir(folder)) {
          if (!entry.isDir) {
            const data = await ffmpeg.readFile(`${folder}/${entry.name}`);
            bundle.push({
              blob: new Blob([(data as Uint8Array).buffer as ArrayBuffer], {
                type: entry.name.endsWith(".m3u8")
                  ? "application/x-mpegURL"
                  : "video/MP2T",
              }),
              name: `${folder}/${entry.name}`,
            });
          }
        }
      }
      const masterData = await ffmpeg.readFile("master.m3u8");
      bundle.push({
        blob: new Blob([(masterData as Uint8Array).buffer as ArrayBuffer], {
          type: "application/x-mpegURL",
        }),
        name: "master.m3u8",
      });

      const totalMB =
        bundle.reduce((acc, r) => acc + r.blob.size, 0) / (1024 * 1024);

      // Post-compression size validation
      if (totalMB > 15 && mode === "normal") {
        setProcessState("compressed");
        setSizeInfo({
          original: selectedFile.size / (1024 * 1024),
          compressed: totalMB,
        });
        setHlsBundle(bundle); // Allow user to see what happened
        upsertStage(
          "compress",
          "Size exceeds limits",
          "error",
          `Resulting bundle is ${totalMB.toFixed(1)}MB. Try High Compression?`,
        );
        toast.warning(
          "Video is slightly over 15MB. We recommend 'High Compression' to ensure successful upload.",
        );
        return;
      }

      if (totalMB > 15 && mode === "high") {
        throw new Error(
          `Even with high compression, version is too large (${totalMB.toFixed(1)}MB). Max 15MB allowed.`,
        );
      }

      setSizeInfo({
        original: selectedFile.size / (1024 * 1024),
        compressed: totalMB,
      });
      setHlsBundle(bundle);
      const playlist = bundle.find((r) => r.name === "master.m3u8");
      const playlistFile = new File(
        [playlist?.blob || new Blob()],
        "master.m3u8",
        {
          type: "application/x-mpegURL",
        },
      );
      setCompressedFile(playlistFile);
      setUploadProgress(null);
      setProcessState("compressed");

      upsertStage(
        "compress",
        "Video ready to upload",
        "done",
        `720p + 360p · ${totalMB.toFixed(1)} MB total.`,
      );

      // Automatically trigger signing and upload after compression
      setTimeout(() => {
        handleUploadAndSign(bundle, playlistFile);
      }, 500);
    } catch (error) {
      if (error instanceof Error && error.message.includes("terminated")) {
        console.log("FFmpeg was terminated by user.");
      } else {
        console.error(error);
        toast.error(
          `Processing failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      upsertStage(
        "compress",
        "Compressing video",
        "error",
        error instanceof Error ? error.message : "Compression failed.",
      );
      setFile(null);
      setCompressedFile(null);
      setProcessState("idle");
    } finally {
      isProcessingRef.current = false;
    }
  };

  // --- Video Upload ---
  const handleUploadAndSign = async (
    overrideBundle?: { blob: Blob; name: string }[],
    overrideFile?: File,
  ) => {
    const targetFile = overrideFile || compressedFile;
    const targetBundle = overrideBundle || hlsBundle;

    console.log("handleUploadAndSign triggered:", {
      hasTargetFile: !!targetFile,
      bundleSize: targetBundle?.length,
      currentProcessState: processState,
    });

    if (!targetFile || !targetBundle.length) {
      console.error("Missing video assets for upload:", {
        targetFile,
        targetBundle,
      });
      toast.error("Video data missing. Please re-select your file.");
      return;
    }

    let phase: "signing" | "uploading" = "signing";
    try {
      setProcessState("signing_video");
      setUploadProgress(null);
      upsertStage(
        "video-sign",
        "Signing video upload",
        "active",
        "Waiting for wallet confirmation.",
      );
      const { key, useKeychain } = await authenticateOperation("posting");
      const username = session?.user?.name || "";
      toast.info("Awaiting Steem Keychain signature...");
      await steemApi.signMessage(
        username,
        `steempro_short_${Date.now()}`,
        key,
        useKeychain,
      );
      upsertStage(
        "video-sign",
        "Signing video upload",
        "done",
        "Upload signature received.",
      );

      phase = "uploading";
      setProcessState("uploading_video");
      upsertStage(
        "video-upload",
        "Uploading video to IPFS",
        "active",
        "Starting upload.",
      );

      if (!targetBundle.length) throw new Error("HLS bundle missing.");
      const formData = new FormData();
      formData.append("username", username);
      targetBundle.forEach((r) => formData.append("files", r.blob, r.name));

      // SSE-based upload — server streams progress events back
      const responseData: any = await new Promise((resolve, reject) => {
        (async () => {
          try {
            const res = await fetch("/api/pinata/upload-hls", {
              method: "POST",
              body: formData,
            });
            if (!res.body) throw new Error("No response stream");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              // Parse SSE lines
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? ""; // keep incomplete last line

              let event = "";
              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  event = line.slice(7).trim();
                } else if (line.startsWith("data: ")) {
                  try {
                    const payload = JSON.parse(line.slice(6));
                    if (event === "progress") {
                      const pct: number = payload.percent ?? 0;
                      setUploadProgress(pct);
                      const label =
                        payload.phase === "preparing"
                          ? "Preparing files"
                          : "Uploading to IPFS";
                      upsertStage("video-upload", label, "active", `${pct}%`);
                    } else if (event === "result") {
                      resolve(payload);
                    } else if (event === "error") {
                      reject(new Error(payload.message ?? "Upload failed"));
                    }
                  } catch {
                    /* ignore parse errors */
                  }
                }
              }
            }
          } catch (err) {
            reject(err);
          }
        })();
      });

      setVideoCid(responseData.cid || responseData.IpfsHash || "");
      setUploadProgress(null);
      setProcessState("done");
      // REMOVED setActiveStep(2) to allow user to see success before continuing
      upsertStage(
        "video-upload",
        "Uploading video to IPFS",
        "done",
        "Video stored successfully.",
      );
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error(error);
      const isCancel =
        error instanceof Error &&
        (error.message.toLowerCase().includes("cancel") ||
          error.message.toLowerCase().includes("reject"));

      const errorMsg = isCancel
        ? "Action cancelled by user."
        : error instanceof Error
          ? error.message
          : "Video upload failed.";

      upsertStage(
        phase === "signing" ? "video-sign" : "video-upload",
        phase === "signing"
          ? "Signing video upload"
          : "Uploading video to IPFS",
        "error",
        errorMsg,
      );
      toast.error(
        isCancel ? "Upload cancelled." : `Upload failed: ${errorMsg}`,
      );
      setProcessState("compressed");
    }
  };

  // --- Thumbnail Upload ---
  const handleThumbnailUpload = async (imgFile: File) => {
    setIsProcessingThumbnail(true);
    setImageUploadProgress(null);
    try {
      const { key, useKeychain } = await authenticateOperation("posting");
      const base64Data = (await toBase64(imgFile)) as string;
      const username = session?.user?.name || "";
      setProcessState("signing_thumbnail");
      upsertStage(
        "thumb-sign",
        "Signing thumbnail upload",
        "active",
        "Preparing image signature.",
      );
      const signature = await steemApi.signImage(
        username,
        base64Data,
        key,
        useKeychain,
      );
      if (!signature) throw new Error("Thumbnail signing failed");
      upsertStage(
        "thumb-sign",
        "Signing thumbnail upload",
        "done",
        "Thumbnail signature approved.",
      );
      setProcessState("uploading_thumbnail");
      upsertStage(
        "thumb-upload",
        "Uploading thumbnail",
        "active",
        "Sending image.",
      );
      const url = await steemApi.uploadImage(
        imgFile,
        username,
        signature.toString(),
        (progress) => {
          setImageUploadProgress(progress);
          upsertStage(
            "thumb-upload",
            "Uploading thumbnail",
            "active",
            `${progress}% uploaded`,
          );
        },
      );
      if (!url) throw new Error("Thumbnail upload returned no URL");
      setThumbnailUrl(url);
      setThumbnailFile(imgFile);
      setShowThumbnail(true);
      setProcessState(videoCid ? "done" : "compressed");
      setActiveStep(4);
      upsertStage(
        "thumb-upload",
        "Uploading thumbnail",
        "done",
        "Thumbnail ready.",
      );
      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Thumbnail upload failed");
      upsertStage(
        processState === "signing_thumbnail" ? "thumb-sign" : "thumb-upload",
        processState === "signing_thumbnail"
          ? "Signing thumbnail upload"
          : "Uploading thumbnail",
        "error",
        error instanceof Error ? error.message : "Thumbnail upload failed.",
      );
      setProcessState(videoCid ? "done" : "compressed");
    } finally {
      setIsProcessingThumbnail(false);
      setImageUploadProgress(null);
    }
  };

  // --- Capture Frame ---
  const handleCaptureFrame = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      toast.error("Video not ready for capture.");
      return;
    }

    setIsProcessingThumbnail(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Optimization for GetImageData

      if (!ctx) throw new Error("Canvas context failed");

      let attempt = 0;
      const maxAttempts = 5;
      let isBlank = true;

      while (isBlank && attempt < maxAttempts) {
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Check the center pixel for transparency (Alpha channel)
        const pixel = ctx.getImageData(
          canvas.width / 2,
          canvas.height / 2,
          1,
          1,
        ).data;

        if (pixel[3] > 0) {
          isBlank = false; // We found a non-transparent pixel!
        } else {
          attempt++;
          console.warn(`Attempt ${attempt}: Frame is transparent. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for GPU buffer
        }
      }

      if (isBlank) {
        throw new Error(
          "Could not capture a valid frame. Try playing/pausing the video.",
        );
      }

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const imgFile = new File([blob], "thumb.jpg", { type: "image/jpeg" });
          await handleThumbnailUpload(imgFile);
          setIsProcessingThumbnail(false);
        },
        "image/jpeg",
        0.9,
      );
    } catch (error: any) {
      toast.error(error.message);
      setIsProcessingThumbnail(false);
    }
  };
  // --- Cancel ---
  const handleCancelAndClose = () => {
    if (
      ffmpegRef.current &&
      (processState === "loading_ffmpeg" || processState === "compressing")
    ) {
      try {
        ffmpegRef.current.terminate();
      } catch (e) {
        console.error(e);
      }
    }
    resetState();
    router.push("/shorts");
  };

  // --- Body text for post ---
  const getBodyText = () => {
    if (!videoCid) return "";
    const descriptionText = description ? `${description}\n\n` : "";
    const thumbnailMarkdown = thumbnailUrl
      ? `\n<center>\n  ![Watch Short Video](${thumbnailUrl})\n</center>\n`
      : "";
    return `${descriptionText}${thumbnailMarkdown}\n<center>\n  [Watch Short Video](SHORTS_URL)\n</center>\n`;
  };

  // --- Publish handlers ---
  const handlePublished = () => {
    toast.success("Short uploaded successfully!");
    resetState();
    router.push("/shorts");
  };

  const handlePublishPending = (pending: boolean) => {
    setIsPublishing(pending);
    if (pending) {
      setUploadProgress(null);
      setImageUploadProgress(null);
      setProcessState("publishing");
      setActiveStep(4);
      upsertStage(
        "publish",
        "Publishing to Steem",
        "active",
        "Broadcasting post to the blockchain.",
      );
    }
  };

  useEffect(() => {
    if (!isPublishing && processState === "publishing" && videoCid) {
      upsertStage(
        "publish",
        "Publishing to Steem",
        "done",
        "Post is being finalized.",
      );
    }
  }, [isPublishing, processState, videoCid, upsertStage]);

  // --- Derived ---
  const canEditDetails = !!compressedFile;
  const canManageThumbnail =
    processState === "compressed" ||
    processState === "done" ||
    processState === "publishing";
  const canPublish = processState === "done" && !!title && !!thumbnailUrl;
  const canOpenStep = (step: number) =>
    step === 1 ||
    (step === 2 && !!videoCid) ||
    (step === 3 && !!videoCid) ||
    (step === 4 && !!videoCid);
  const latestStage = stageLog[stageLog.length - 1];
  const recentStageLog = stageLog.slice(-3);

  const stageCards = [
    {
      key: "compress",
      title: "Compression",
      active: [
        "loading_ffmpeg",
        "compressing",
        "compressed",
        "signing_video",
        "uploading_video",
        "done",
        "publishing",
      ].includes(processState),
      complete: [
        "compressed",
        "signing_video",
        "uploading_video",
        "done",
        "publishing",
      ].includes(processState),
      progress:
        processState === "compressing"
          ? (uploadProgress ?? 0)
          : [
                "compressed",
                "signing_video",
                "uploading_video",
                "done",
                "publishing",
              ].includes(processState)
            ? 100
            : 0,
    },
    {
      key: "video",
      title: "Video Upload",
      active: [
        "signing_video",
        "uploading_video",
        "done",
        "publishing",
      ].includes(processState),
      complete: processState === "done" || processState === "publishing",
      progress:
        processState === "uploading_video"
          ? (uploadProgress ?? 0)
          : processState === "done" || processState === "publishing"
            ? 100
            : 0,
    },
    {
      key: "thumb",
      title: "Thumbnail",
      active:
        processState === "signing_thumbnail" ||
        processState === "uploading_thumbnail" ||
        !!thumbnailUrl,
      complete: !!thumbnailUrl,
      progress:
        processState === "uploading_thumbnail"
          ? (imageUploadProgress ?? 0)
          : thumbnailUrl
            ? 100
            : 0,
    },
    {
      key: "publish",
      title: "Publish",
      active: processState === "publishing",
      complete: false,
      progress: processState === "publishing" ? 100 : 0,
    },
  ];

  const flowSteps = [
    {
      step: "01",
      title: "Upload",
      active: activeStep === 1,
      complete: !!compressedFile,
    },
    {
      step: "02",
      title: "Details",
      active: activeStep === 2,
      complete: canEditDetails && !!title,
    },
    {
      step: "03",
      title: "Thumbnail",
      active: activeStep === 3,
      complete: !!thumbnailUrl,
    },
    { step: "04", title: "Publish", active: activeStep === 4, complete: false },
  ];

  return {
    // state
    file,
    compressedFile,
    sizeInfo,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    tagInput,
    setTagInput,
    videoCid,
    thumbnailUrl,
    thumbnailFile,
    isProcessingThumbnail,
    showThumbnail,
    setShowThumbnail,
    processState,
    isPublishing,
    uploadProgress,
    compressionMode,
    processAndUpload,
    imageUploadProgress,
    stageLog,
    activeStep,
    setActiveStep,
    videoRef,
    videoObjectUrl,
    thumbObjectUrl,
    // derived
    canEditDetails,
    canManageThumbnail,
    canPublish,
    canOpenStep,
    latestStage,
    recentStageLog,
    stageCards,
    flowSteps,
    // handlers
    handleFileChange,
    handleUploadAndSign,
    handleThumbnailUpload,
    handleCaptureFrame,
    handleCancelAndClose,
    getBodyText,
    handlePublished,
    handlePublishPending,
    username: session?.user?.name || "",
  };
}
