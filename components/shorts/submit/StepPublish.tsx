"use client";

import { CheckCircle2, AlertCircle, Rocket, FileVideo, Type, Tag, Image as ImageIcon } from "lucide-react";

interface MetricProps { label: string; value: string; icon: any; status: "success" | "warning" | "default"; }
function MetricCard({ label, value, icon: Icon, status }: MetricProps) {
  const statusStyles = {
    success: "border-success/30 bg-success/5 text-success",
    warning: "border-warning/30 bg-warning/5 text-warning",
    default: "border-default-200 bg-default-100/50 text-default-500 dark:border-white/5 dark:bg-white/5"
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${statusStyles[status]}`}>
      <div className="flex items-center justify-between mb-2">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
         <Icon size={14} className="opacity-60" />
      </div>
      <p className="text-sm font-black tracking-tight">{value}</p>
    </div>
  );
}

interface Props {
  title: string;
  thumbnailUrl: string | null;
  videoCid: string | null;
  tags: string[];
  processState: string;
  canPublish: boolean;
}

export function StepPublish({ title, thumbnailUrl, videoCid, tags, processState, canPublish }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <Rocket size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-success">Step 04</p>
          <h3 className="text-xl font-black tracking-tight text-foreground">Final Review</h3>
          <p className="text-sm font-medium text-default-500">Review your content before sharing it with the community.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Video Status" 
          value={videoCid ? "Uploaded" : "Pending"} 
          icon={FileVideo}
          status={videoCid ? "success" : "warning"} 
        />
        <MetricCard 
          label="Title" 
          value={title ? "Added" : "Missing"} 
          icon={Type}
          status={title ? "success" : "warning"} 
        />
        <MetricCard 
          label="Thumbnail" 
          value={thumbnailUrl ? "Optimized" : "Pending"} 
          icon={ImageIcon}
          status={thumbnailUrl ? "success" : "warning"} 
        />
        <MetricCard 
          label="Visibility" 
          value={`${tags.length} Tags`} 
          icon={Tag}
          status={tags.length > 0 ? "success" : "default"} 
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-default-200/50 bg-white/5 shadow-inner dark:border-white/5 dark:bg-zinc-900/40">
        <div className="bg-default-100 px-6 py-4 dark:bg-white/5">
           <span className="text-[10px] font-black uppercase tracking-widest text-default-500">Pre-Publishing Checklist</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-6 pb-4 border-b border-default-200/30 dark:border-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className={title ? "text-success" : "text-default-300"} />
              <span className="text-sm font-bold text-default-700">Display Title</span>
            </div>
            <span className="truncate text-sm font-medium text-foreground max-w-[200px]">{title || "—"}</span>
          </div>

          <div className="flex items-center justify-between gap-6 pb-4 border-b border-default-200/30 dark:border-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className={thumbnailUrl ? "text-success" : "text-default-300"} />
              <span className="text-sm font-bold text-default-700">Cover Thumbnail</span>
            </div>
            <span className="text-sm font-medium text-foreground">{thumbnailUrl ? "Ready" : "Incomplete"}</span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full animate-pulse ${canPublish ? "bg-success" : "bg-warning"}`} />
              <span className="text-sm font-bold text-default-700">Publishing Status</span>
            </div>
            <div className="flex items-center gap-2">
               {canPublish ? <CheckCircle2 size={14} className="text-success" /> : <AlertCircle size={14} className="text-warning" />}
               <span className={`text-sm font-black uppercase tracking-tighter ${canPublish ? "text-success" : "text-warning"}`}>
                 {processState === "publishing" ? "Publishing now..."
                   : canPublish ? "Ready to publish"
                   : "Action Required"}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
