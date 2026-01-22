/**
 * Get the name and icon of the interface (app) from the json_metadata 'app' field.
 * @param appStr The 'app' string from json_metadata (e.g., 'steempro/0.2')
 * @returns An object containing the application name and its icon URL
 */
export function getAppDetails(appStr: string | undefined): {
  name: string;
  icon: string;
  website: string;
} {
  if (!appStr || typeof appStr !== "string") {
    return { name: "Steem", icon: "/favicon-32x32.png", website: "#" };
  }

  // Extract the app name before any '/' (e.g., 'steempro/0.2' -> 'steempro')
  const app = appStr.split("/")[0].toLowerCase().trim();

  const apps: Record<string, { name: string; icon: string; website: string }> =
    {
      steempro: {
        name: "SteemPro",
        icon: "/favicon.ico",
        website: "https://steempro.com",
      },
      steemit: {
        name: "Steemit",
        icon: "https://www.google.com/s2/favicons?domain=https://steemit.com",
        website: "https://steemit.com",
      },
      upvu: {
        name: "UPVU",
        icon: "https://www.google.com/s2/favicons?domain=https://upvu.org",
        website: "https://upvu.org",
      },
      steemx: {
        name: "SteemX",
        icon: "https://www.google.com/s2/favicons?domain=https://steemx.org",
        website: "https://steemx.org",
      },
      steempress: {
        name: "SteemPress",
        icon: "https://www.google.com/s2/favicons?domain=https://steempress.io",
        website: "https://steempress.io",
      },
      ecblog: {
        name: "ECBlog",
        icon: "https://www.google.com/s2/favicons?domain=https://blog.etain.club",
        website: "https://blog.etain.club",
      },
      "steem-mobile": {
        name: "SteemMobile",
        icon: "/steemmobile.png",
        website:
          "https://play.google.com/store/apps/details?id=com.steempro.mobile",
      },
      steemhunt: {
        name: "SteemHunt",
        icon: "https://www.google.com/s2/favicons?domain=https://steemhunt.com",
        website: "https://steemhunt.com",
      },
      wherein: {
        name: "Wherein",
        icon: "http://www.wherein.io/favicon.ico",
        website: "https://wherein.io",
      },

      ppebak: {
        name: "Polypunch",
        icon: "https://www.google.com/s2/favicons?domain=https://ppebak.com",
        website: "https://ppebak.com",
      },

      punchpol: {
        name: "PunchPol",
        icon: "https://www.google.com/s2/favicons?domain=https://punchpol.com",
        website: "https://punchpol.com",
      },
      tagai: {
        name: "TagAI",
        icon: "https://www.google.com/s2/favicons?domain=https://tagai.fun",
        website: "https://tagai.fun",
      },
      speem: {
        name: "Speem",
        icon: "https://www.google.com/s2/favicons?domain=https://speem.watch",
        website: "https://speem.watch",
      },
      "boylikegirl.club": {
        name: "BoyLikeGirl",
        icon: "https://www.google.com/s2/favicons?domain=https://boylikegirl.club",
        website: "https://boylikegirl.club",
      },
      //  "steemcn": {
      //   name: "SteemCN",
      //   icon: "https://www.google.com/s2/favicons?domain=https://steemcn.blog",
      //   website: "https://steemcn.blog",
      // },
    };

  if (apps[app]) {
    return apps[app];
  }

  // Fallback: capitalize the app key and attempt to use Google Favicon service
  const name = app.charAt(0).toUpperCase() + app.slice(1);
  return {
    name,
    icon: `/globe.svg`,
    website: "#",
  };
}
