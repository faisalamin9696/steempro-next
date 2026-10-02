import { auth } from "@/auth";
import CommunityStatsTab from "@/components/community/stats/CommunityStatsTab";
import SignInCard from "@/components/dashboard/SignInCard";
import Link from "@/components/ui/CustomLink";
import { getCommunityStats } from "@/utils/communityStats";
import { Role } from "@/utils/community";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

const TAG_RE = /^[a-z][a-z0-9.-]{2,19}$/;
const VIEWER_RE = /^[a-z0-9.-]{2,20}$/;

/**
 * Per-community admin stats panel (mod and above).
 *
 * The gate runs against the viewer's real role as reported by SDS
 * (`observer_role`) — it selects a view, not a permission: everything shown
 * here is also public on /stats/<tag>. `?as=<account>` lets a logged-out
 * session preview the panel for testing (same public data, real role).
 */
export default async function CommunityDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { tag } = await params;
  const { as } = await searchParams;
  if (!TAG_RE.test(tag)) notFound();

  const session = await auth();
  const sessionUser = session?.user?.name ?? null;
  const preview =
    typeof as === "string" && VIEWER_RE.test(as) ? as : null;
  const viewer = sessionUser ?? preview;
  if (!viewer) return <SignInCard />;
  // keep the preview param on in-page links while logged out
  const previewUsed = preview && !sessionUser ? preview : null;

  const stats = await getCommunityStats(tag, "7d", viewer, true).catch(
    () => null,
  );
  if (!stats) return <LoadError tag={tag} as={previewUsed} />;

  const isStaff = (() => {
    try {
      return Role.atLeast(stats.viewerRole || "", "mod");
    } catch {
      return false;
    }
  })();
  if (!isStaff)
    return (
      <LockedCard tag={tag} title={stats.community.title} as={previewUsed} />
    );

  return (
    <div className="flex flex-col gap-4 pb-10">
      <header>
        <Link
          href={previewUsed ? `/dashboard?as=${previewUsed}` : "/dashboard"}
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="text-xl font-bold mt-1.5 flex items-center gap-2">
          {stats.community.title}
        </h1>
        <p className="text-sm text-default-400 mt-0.5">
          <AdminSub name={stats.community.title} />
        </p>
      </header>
      <CommunityStatsTab
        account={tag}
        viewer={viewer}
        initialStats={stats}
        compare
        fullView
      />
    </div>
  );
}

async function AdminSub({ name }: { name: string }) {
  const t = await getTranslations("Dashboard");
  return <>{t("adminSub", { name })}</>;
}

/** Staff-role check failed open → honest locked state. */
async function LockedCard({
  tag,
  title,
  as,
}: {
  tag: string;
  title: string;
  as?: string | null;
}) {
  const t = await getTranslations("Dashboard");
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-8 text-center max-w-lg mx-auto mt-10">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 text-2xl">
        🔒
      </div>
      <h1 className="text-lg font-bold">{t("adminOnly")}</h1>
      <p className="text-sm text-default-400 mt-1.5">{t("adminOnlySub")}</p>
      <p className="text-xs text-default-400 mt-2 font-semibold">{title}</p>
      <div className="flex items-center justify-center gap-3 mt-4">
        <Link
          href={`/stats/${tag}`}
          className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
        >
          {t("backToStats")}
        </Link>
        <Link
          href={as ? `/dashboard?as=${as}` : "/dashboard"}
          className="px-3 py-2 rounded-lg bg-default-500/10 text-default-500 text-xs font-bold hover:bg-default-500 hover:text-white transition-colors"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}

async function LoadError({ tag, as }: { tag: string; as?: string | null }) {
  const t = await getTranslations("Dashboard");
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-8 text-center max-w-lg mx-auto mt-10">
      <h1 className="text-lg font-bold">{t("loadError")}</h1>
      <div className="flex items-center justify-center gap-3 mt-4">
        <Link
          href={`/stats/${tag}`}
          className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
        >
          {t("backToStats")}
        </Link>
        <Link
          href={as ? `/dashboard?as=${as}` : "/dashboard"}
          className="px-3 py-2 rounded-lg bg-default-500/10 text-default-500 text-xs font-bold hover:bg-default-500 hover:text-white transition-colors"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
