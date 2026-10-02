import { getTranslations } from "next-intl/server";

/**
 * Shown on dashboard routes when nobody is signed in (server-rendered —
 * the stats endpoints themselves are public data; the session only decides
 * whose stats the dashboard shows by default).
 */
export default async function SignInCard() {
  const t = await getTranslations("Dashboard");

  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-8 text-center max-w-lg mx-auto mt-10">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
      <h1 className="text-lg font-bold">{t("signIn")}</h1>
      <p className="text-sm text-default-400 mt-1.5">{t("signInSub")}</p>
    </div>
  );
}
