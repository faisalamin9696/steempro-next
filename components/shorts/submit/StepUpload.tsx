"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  LoaderCircle,
  UploadCloud,
  MonitorPlay,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/react";
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Compact Guidelines Section */}
      <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 to-secondary/5 p-4 border border-primary/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-0.5">
              Creator Guidelines
            </h4>
            <p className="text-xs font-medium text-default-500 leading-normal">
              Vertical (9:16) clip up to{" "}
              <span className="text-foreground font-bold underline decoration-primary/30">
                60s
              </span>. Final size: <span className="text-foreground font-bold">15MB max</span>.
            </p>
          </div>
        </div>
      </div>

      {isIdle ? (
        /* High-End Drop zone */
        <label className="group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-6 rounded-4xl border-2 border-dashed border-default-300 bg-default-50/50 px-8 py-12 text-center transition-all duration-500 hover:border-primary/60 hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/5 dark:border-white/10 dark:bg-zinc-950/20">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative rounded-3xl bg-linear-to-br from-primary to-danger p-6 text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UploadCloud size={32} strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">
              Select your clip
            </h3>
            <p className="text-sm font-medium text-default-500 max-w-[240px] mx-auto">
              Drag and drop or click to browse <br />
              (MP4, MOV, or WebM)
            </p>
          </div>

          <input
            type="file"
            accept="video/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
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
                sizeInfo.compressed > 15
                  ? "border-danger/30 bg-linear-to-br from-danger/10 to-transparent shadow-danger/5"
                  : "border-warning/30 bg-linear-to-br from-warning/10 to-transparent shadow-warning/5"
              }`}
            >
              <div
                className={`absolute -right-6 -bottom-6 rotate-12 ${
                  sizeInfo.compressed > 15 ? "text-danger/10" : "text-warning/10"
                }`}
              >
                {sizeInfo.compressed > 15 ? (
                  <Sparkles size={120} />
                ) : (
                  <UploadCloud size={120} />
                )}
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      sizeInfo.compressed > 15
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
                      {sizeInfo.compressed > 15
                        ? "Size Limit Exceeded"
                        : "Optimization Complete"}
                    </h4>
                    <p
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        sizeInfo.compressed > 15
                          ? "text-danger/80"
                          : "text-warning/80"
                      }`}
                    >
                      {sizeInfo.compressed > 15
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
                    tone={sizeInfo.compressed > 15 ? "text-danger" : "text-primary"}
                  />
                </div>

                <div className="space-y-3">
                  {sizeInfo.compressed > 15 ? (
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
                    {sizeInfo.compressed > 15
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
