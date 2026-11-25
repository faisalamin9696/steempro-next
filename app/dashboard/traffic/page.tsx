import Link from "@/components/ui/CustomLink";
import TrafficDashboard from "@/components/dashboard/TrafficDashboard";
import { analyticsAdmin } from "@/libs/analytics/auth";
import { clientIp } from "@/libs/analytics/request";
import { snapshotFor } from "@/libs/analytics/store";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Traffic",
  robots: { index: false, follow: false },
};

/**
 * Operator-only traffic view.
 *
 * Deliberately not translated: it is an internal screen behind `MODERATORS` /
 * `ANALYTICS_ADMINS`, not a player-facing page.
 */
export default async function TrafficPage() {
  const admin = await analyticsAdmin();

  if (!admin) {
    return (
      <div className="flex flex-col gap-3 pb-10">
        <h1 className="text-xl font-bold">Traffic</h1>
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-5">
          <p className="text-sm font-semibold">Operators only</p>
          <p className="text-sm text-default-500 mt-1">
            This page is limited to accounts listed in the{" "}
            <code className="text-xs">MODERATORS</code> or{" "}
            <code className="text-xs">ANALYTICS_ADMINS</code> environment
            variable. Sign in with one of those accounts, or ask the site owner
            to add yours.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const requestHeaders = await headers();
  const snapshot = snapshotFor(24);

  return (
    <TrafficDashboard
      initial={{ ...snapshot, viewerIp: clientIp(requestHeaders) }}
      viewerIp={clientIp(requestHeaders)}
    />
  );
}
