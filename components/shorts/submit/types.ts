export type ProcessState =
  | "idle"
  | "loading_ffmpeg"
  | "compressing"
  | "compressed"
  | "signing_video"
  | "uploading_video"
  | "done"
  | "signing_thumbnail"
  | "uploading_thumbnail"
  | "publishing";

export type StageStatus = "pending" | "active" | "done" | "error";

export interface StageEntry {
  key: string;
  label: string;
  detail?: string;
  status: StageStatus;
}

export interface StageCard {
  key: string;
  title: string;
  active: boolean;
  complete: boolean;
  progress: number;
}

export interface FlowStep {
  step: string;
  title: string;
  active: boolean;
  complete: boolean;
}
