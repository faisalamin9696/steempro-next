/**
 * Get the name and icon of the interface (app) from the json_metadata 'app' field.
 * @param appStr The 'app' string from json_metadata (e.g., 'steempro/0.2')
 * @returns An object containing the application name and its icon URL
 */
export function getAppDetails(appStr: string | undefined): {
  name: string;
  icon: string;
} {
  if (!appStr || typeof appStr !== "string") {
    return { name: "Steem", icon: "/favicon-32x32.png" };
  }

  // Extract the app name before any '/' (e.g., 'steempro/0.2' -> 'steempro')
  const app = appStr.split("/")[0].toLowerCase().trim();

  const apps: Record<string, { name: string; icon: string }> = {
    steempro: { name: "SteemPro", icon: "/favicon.ico" },
    steemit: {
      name: "Steemit",
      icon: "https://www.google.com/s2/favicons?domain=steemit.com",
    },
    upvu: {
      name: "UPVU",
      icon: "https://www.google.com/s2/favicons?domain=upvu.org",
    },
    steemx: {
      name: "SteemX",
      icon: "https://www.google.com/s2/favicons?domain=steemx.org",
    },
    steempress: {
      name: "SteemPress",
      icon: "https://www.google.com/s2/favicons?domain=steempress.io",
    },
    // ecblog: {
    //   name: "ECBlog",
    //   icon: "https://blog.etain.club/favicon.ico",
    // },
    "steem-mobile": {
      name: "SteemMobile",
      icon: "/steemmobile.png",
    },
    steemhunt: {
      name: "SteemHunt",
      icon: "https://www.google.com/s2/favicons?domain=steemhunt.com",
    },
    wherein: {
      name: "Wherein",
      icon: "https://www.google.com/s2/favicons?domain=wherein.io",
    },
  };

  if (apps[app]) {
    return apps[app];
  }

  // Fallback: capitalize the app key and attempt to use Google Favicon service
  const name = app.charAt(0).toUpperCase() + app.slice(1);
  return {
    name,
    icon: `/globe.svg`,
  };
}
