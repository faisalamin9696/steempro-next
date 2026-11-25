import { auth } from "@/auth";

/**
 * Who may see request analytics and change the blocklist.
 *
 * Reuses the project's existing operator list (`MODERATORS`, the same env the
 * boost route reads) and adds an optional `ANALYTICS_ADMINS` for people who
 * should see traffic but not moderate boosts. With neither set the page is
 * closed to everyone — an empty allowlist fails closed.
 */

function list(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

export function analyticsAdmins(): string[] {
  return [
    ...new Set([
      ...list(process.env.ANALYTICS_ADMINS),
      ...list(process.env.MODERATORS),
    ]),
  ];
}

export function isAnalyticsAdmin(name: string | null | undefined): boolean {
  if (!name) return false;
  return analyticsAdmins().includes(name);
}

/** The signed-in operator, or `null` when the viewer may not use this page. */
export async function analyticsAdmin(): Promise<string | null> {
  const session = await auth();
  const name = session?.user?.name ?? null;
  return isAnalyticsAdmin(name) ? name : null;
}
