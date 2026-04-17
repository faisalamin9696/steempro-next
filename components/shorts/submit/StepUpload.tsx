"use client";
import React, { useState, useRef } from "react";

import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  LoaderCircle,
  UploadCloud,
  MonitorPlay,
  Zap,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Constants } from "@/constants";
import type { StageEntry, StageCard } from "./types";

interface Props {
  file: File | null;
  processState: string;
  stageCards: StageCard[];
  recentStageLog: StageEntry[];
  uploadProgress: number | null;
  sizeInfo: { original: number; compressed: number };
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadAndSign: () => void;
  onRecompress?: () => void;
  onNext?: () => void;
  videoCid?: string | null;
  compressionMode?: "normal" | "high";
}

export function StageStatusIcon({ status }: { status: string }) {
  if (status === "done")
    return <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />;
  if (status === "error")
    return <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />;
  if (status === "active")
    return (
      <LoaderCircle
        size={18}
        className="mt-0.5 shrink-0 animate-spin text-primary"
      />
    );
  return (
    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-default-300" />
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  icon: any;
  tone?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-default-200/50 bg-default-100/50 p-4 transition-all hover:border-primary/30 dark:border-white/5 dark:bg-white/5">
      <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
        <Icon size={80} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-default-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Icon size={14} className="text-primary/70" />
        <p className={`text-lg font-black tracking-tight ${tone}`}>{value}</p>
      </div>
    </div>
  );
}

export function StepUpload({
  file,
  processState,
  stageCards,
  recentStageLog,
  sizeInfo,
  onFileChange,
  onUploadAndSign,
  onRecompress,
  onNext,
  uploadProgress,
  videoCid,
  compressionMode,
}: Props) {
  const isIdle = !file && processState === "idle";

  // Native WebCam Recorder Engine for Desktop
  const [showWebcam, setShowWebcam] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 }, facingMode: "user" },
        audio: true,
      });
      setShowWebcam(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  };

  const startStreamRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const recordFile = new File([blob], "webcam-recording.webm", { type: 'video/webm' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(recordFile);
      onFileChange({ target: { files: dataTransfer.files } } as any);
      
      closeWebcam();
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 59) {
           stopStreamRecording();
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopStreamRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const closeWebcam = () => {
    setShowWebcam(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRecordClick = (e: React.MouseEvent) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      startWebcam();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Compact Guidelines Section */}
      {/* <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 to-secondary/5 p-4 border border-primary/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-0.5">
              Creator Guidelines
            </h4>
            <p className="text-xs font-medium text-default-500 leading-normal">
              Video clip up to{" "}
              <span className="text-foreground font-bold underline decoration-primary/30">
                60s
              </span>. Final size: <span className="text-foreground font-bold">{Constants.SHORTS_ALLOWED_SIZE}MB max</span>.
            </p>
          </div>
        </div>
      </div> */}

      {showWebcam ? (
        /* Native WebRTC Camera UI */
        <div className="relative w-full max-w-[400px] mx-auto aspect-9/16 bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-zinc-900">
          <video 
            ref={videoRef} 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
          />
          
          <div className="absolute top-6 inset-x-0 flex justify-between items-start px-6 z-20">
            {isRecording && (
               <div className="bg-danger/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 <span className="font-mono text-xs font-bold tracking-widest">{recordingTime}s / 60s</span>
               </div>
            )}
            <button 
              onClick={closeWebcam} 
              className="bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ml-auto border border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-10 inset-x-0 flex justify-center z-20">
            <button
              onClick={isRecording ? stopStreamRecording : startStreamRecording}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? "border-danger bg-danger/20 scale-95" 
                  : "border-white bg-white/20 hover:scale-105"
              }`}
            >
               <div className={`transition-all duration-300 bg-danger ${isRecording ? "w-6 h-6 rounded-md" : "w-14 h-14 rounded-full"}`} />
            </button>
          </div>
        </div>
      ) : isIdle ? (
        /* Dual Options for Mobile & Desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Quick Record Tile */}
          <label 
            onClick={handleRecordClick}
            className="group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-5 rounded-4xl border-2 border-dashed border-default-300 bg-default-50/50 px-6 py-8 text-center transition-all duration-500 hover:border-danger/60 hover:bg-danger/5 hover:shadow-2xl hover:shadow-danger/5 dark:border-white/10 dark:bg-zinc-950/20"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-danger/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative rounded-3xl bg-linear-to-br from-danger to-orange-500 p-5 text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <Video size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight">Record Video</h3>
              <p className="text-[13px] font-medium text-default-500 max-w-[180px] mx-auto">
                Open camera & record natively on mobile
              </p>
            </div>
            <input
              type="file"
              accept="video/*"
              capture="environment"
              onChange={onFileChange}
              className="hidden"
            />
          </label>

          {/* Gallery Browse Tile */}
          <label className="group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-5 rounded-4xl border-2 border-dashed border-default-300 bg-default-50/50 px-6 py-8 text-center transition-all duration-500 hover:border-primary/60 hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/5 dark:border-white/10 dark:bg-zinc-950/20">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative rounded-3xl bg-linear-to-br from-primary to-indigo-500 p-5 text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <UploadCloud size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight">Browse Files</h3>
              <p className="text-[13px] font-medium text-default-500 max-w-[180px] mx-auto">
                Select from gallery (MP4, MOV, WebM)
              </p>
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stage Progress Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stageCards.slice(0, 2).map((stage) => (
              <div
                key={stage.key}
                className={`group relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 ${
                  stage.complete
                    ? "border-success/30 bg-success/5 shadow-sm shadow-success/10"
                    : stage.active
                      ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-default-200/50 bg-default-100/50 dark:border-white/5 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p
                    className={`text-[11px] font-black uppercase tracking-widest ${stage.active ? "text-primary" : "text-default-400"}`}
                  >
                    {stage.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {stage.complete ? (
                      <span className="text-[10px] font-bold text-success capitalize">
                        Completed
                      </span>
                    ) : stage.active ? (
                      <span className="text-[10px] font-bold text-primary animate-pulse uppercase">
                        In Progress
                      </span>
                    ) : null}
                    {stage.complete ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : stage.active ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin text-primary"
                      />
                    ) : null}
                  </div>
                </div>
                <Progress
                  aria-label={`${stage.title} progress`}
                  value={stage.progress}
                  color={stage.complete ? "success" : "primary"}
                  size="sm"
                  radius="full"
                  className="transition-all duration-300"
                />
              </div>
            ))}
          </div>

          {/* Activity Log */}
          {recentStageLog.length > 0 && (
            <div className="rounded-3xl border border-default-200/40 bg-default-50/50 p-5 dark:border-white/5 dark:bg-white/2">
              <h5 className="text-[10px] font-black uppercase tracking-[0.24em] text-default-400 mb-4 px-1">
                Processing Timeline
              </h5>
              <div className="space-y-4">
                {recentStageLog.map((stage) => (
                  <div
                    key={stage.key}
                    className="flex items-start gap-4 transition-all"
                  >
                    <div className="relative mt-1">
                      <StageStatusIcon status={stage.status} />
                      <div className="absolute left-[8px] top-6 w-px h-full bg-default-200 hidden last:hidden" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground leading-none">
                        {stage.label}
                      </p>
                      {stage.detail && (
                        <p className="mt-1.5 text-xs font-medium text-default-500 leading-relaxed wrap-break-word">
                          {stage.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result Card — Only show when fully uploaded to IPFS */}
          {processState === "done" && (
            <div className="relative overflow-hidden rounded-4xl border border-success/30 bg-linear-to-br from-success/10 to-transparent p-6 shadow-xl shadow-success/5 animate-in zoom-in-95 duration-500">
              <div className="absolute -right-6 -bottom-6 text-success/10 rotate-12">
                <FileCheck size={120} />
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-success/20 p-2 text-success">
                    <FileCheck size={20} />
                  </div>
                  <h4 className="text-lg font-black text-foreground">
                    Upload Successful
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    label="HLS Bundle"
                    value={`${sizeInfo.compressed.toFixed(1)} MB`}
                    icon={MonitorPlay}
                    tone="text-primary"
                  />
                  <MetricCard
                    label="IPFS ID"
                    value={videoCid?.slice(0, 8) + "..."}
                    icon={Zap}
                  />
                </div>

                <Button
                  size="lg"
                  color="success"
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-sm text-white shadow-xl shadow-success/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                  onPress={onNext}
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {/* Retry / Manual Start Card — Shown if upload was cancelled or failed */}
          {processState === "compressed" && (
            <div
              className={`relative overflow-hidden rounded-4xl border p-6 shadow-xl animate-in slide-in-from-bottom-5 duration-500 ${
                sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                  ? "border-danger/30 bg-linear-to-br from-danger/10 to-transparent shadow-danger/5"
                  : "border-warning/30 bg-linear-to-br from-warning/10 to-transparent shadow-warning/5"
              }`}
            >
              <div
                className={`absolute -right-6 -bottom-6 rotate-12 ${
                  sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE ? "text-danger/10" : "text-warning/10"
                }`}
              >
                {sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE ? (
                  <Sparkles size={120} />
                ) : (
                  <UploadCloud size={120} />
                )}
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                        ? "bg-danger/20 text-danger"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {sizeInfo.compressed > 10 ? (
                      <AlertCircle size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-foreground truncate">
                      {sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                        ? "Size Limit Exceeded"
                        : "Optimization Complete"}
                    </h4>
                    <p
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                          ? "text-danger/80"
                          : "text-warning/80"
                      }`}
                    >
                      {sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                        ? "Requires High Compression"
                        : "Pending Submission"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    label="Original Size"
                    value={`${sizeInfo.original.toFixed(1)} MB`}
                    icon={MonitorPlay}
                  />
                  <MetricCard
                    label="Current Size"
                    value={`${sizeInfo.compressed.toFixed(1)} MB`}
                    icon={Zap}
                    tone={sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE ? "text-danger" : "text-primary"}
                  />
                </div>

                <div className="space-y-3">
                  {sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE ? (
                    <Button
                      size="lg"
                      color="danger"
                      className="w-full font-black uppercase tracking-widest text-sm shadow-xl shadow-danger/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
                      onPress={() => onRecompress?.()}
                    >
                      Run High Compression
                    </Button>
                  ) : (
                    <Button
                      size="md"
                      color="primary"
                      className="w-full font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
                      onPress={() => onUploadAndSign()}
                    >
                      Sign & Upload Video
                    </Button>
                  )}
                  <p className="text-center text-[11px] font-bold text-default-500/80 uppercase tracking-tighter">
                    {sizeInfo.compressed > Constants.SHORTS_ALLOWED_SIZE
                      ? "Use high-intensity compression to fit within the decentralized storage limit."
                      : "A signature is required to securely store your video on IPFS."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Progress for Auto-Upload */}
          {(processState === "signing_video" || processState === "uploading_video") && (
             <div className="relative overflow-hidden rounded-4xl border border-primary/20 bg-linear-to-br from-primary/5 to-transparent p-8 text-center animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex flex-col items-center gap-4">
                   <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                         <Zap size={32} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xl font-black text-foreground tracking-tight">
                        {processState === "signing_video" ? "Awaiting Signature" : "Staging to IPFS"}
                      </h4>
                      <p className="text-sm font-medium text-default-500">
                         {processState === "signing_video" ? "Confirm the transaction in your wallet..." : "Broadcasting chunks to the decentralized web..."}
                      </p>
                   </div>
                   {uploadProgress !== null && (
                      <div className="w-full max-w-xs space-y-2 mt-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                           <span>Progress</span>
                           <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-default-100 overflow-hidden">
                           <div 
                             className="h-full bg-primary transition-all duration-300" 
                             style={{ width: `${uploadProgress}%` }}
                           />
                        </div>
                      </div>
                   )}
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
