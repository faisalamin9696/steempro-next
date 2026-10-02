import { auth } from "@/auth";
import DashboardHome from "@/components/dashboard/DashboardHome";
import SignInCard from "@/components/dashboard/SignInCard";
import { getAuthorStats } from "@/utils/communityStats";

/**
 * Personal stats dashboard.
 *
 * Whose stats are shown: the signed-in user, or — when logged out — an
 * explicit `?as=<account>` preview (public blockchain data, same policy as
 * the public stats endpoints; nothing private lives behind this gate).
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const session = await auth();
  const { as } = await searchParams;

  const sessionUser = session?.user?.name ?? null;
  const preview =
    typeof as === "string" && /^[a-z0-9.-]{2,20}$/.test(as) ? as : null;
  const target = sessionUser ?? preview;

  if (!target) return <SignInCard />;

  // SSR seed: the default 7d bundle (with compare) — memo-shared with the
  // API endpoint so first paint shows real numbers without a client fetch.
  const initialStats = await getAuthorStats(target, "7d", true).catch(
    () => undefined,
  );

  // Preview links keep the `as` param so navigating the dashboard while
  // logged out stays in preview mode.
  const previewAs = preview && !sessionUser ? preview : undefined;

  return (
    <DashboardHome
      user={target}
      initialStats={initialStats}
      previewAs={previewAs}
    />
  );
}
