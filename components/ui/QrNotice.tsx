import { Alert } from "@heroui/alert";
import type { ReactNode } from "react";

interface QrNoticeProps {
  tone: "warning" | "danger";
  title: string;
  /** One-line reason under the title, already chosen by the caller. */
  hint?: string;
  /** Buttons — every state picks its own labels. */
  actions?: ReactNode;
  /** The message line(s). */
  children?: ReactNode;
}

/**
 * The one alert shape every QR failure/notice state uses (revoked, failed,
 * expired) — shared by the login and approval panels so they stay identical.
 */
export default function QrNotice({
  tone,
  title,
  hint,
  actions,
  children,
}: QrNoticeProps) {
  return (
    <Alert
      color={tone}
      variant="faded"
      title={title}
      description={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            {children && <p className="text-sm">{children}</p>}
            {hint && <p className="text-xs text-muted">{hint}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      }
    />
  );
}
