"use client";

import ErrorCard from "@/components/ui/ErrorCard";

interface ReloadErrorCardProps {
  /** Replaces the default "Something went wrong" heading. */
  title?: string;
  /** Replaces the default body copy. */
  message?: string;
  /**
   * Backing error for the "Show Technical Details" disclosure. Only the
   * `message` reaches this component — a real `Error` instance cannot cross
   * the server/client boundary, so it is rebuilt from the string.
   */
  errorMessage?: string;
}

/**
 * Server components may only pass serializable props to a client component,
 * so they cannot hand `ErrorCard` its required `reset` callback directly.
 * This wrapper lives on the client and owns that callback (a full reload, the
 * only reset that makes sense for a failed server-side lookup).
 */
const ReloadErrorCard = ({
  title,
  message,
  errorMessage,
}: ReloadErrorCardProps) => (
  <ErrorCard
    error={new Error(errorMessage || message || "Request failed")}
    reset={() => window.location.reload()}
    title={title}
    message={message}
  />
);

export default ReloadErrorCard;
