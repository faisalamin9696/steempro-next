import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read locale from cookie as we're not using URL prefix
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale =
    cookieLocale && locales.includes(cookieLocale as any)
      ? cookieLocale
      : defaultLocale;

  return {
    locale: locale as string,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
