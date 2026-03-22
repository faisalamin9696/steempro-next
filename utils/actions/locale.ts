"use server";

import { cookies } from "next/headers";
import { locales, Locale } from "@/i18n/config";

/**
 * Updates the NEXT_LOCALE cookie to change the application language.
 * @param locale The new locale to set.
 */
export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    throw new Error("Invalid locale");
  }

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
