const CACHE_KEY = "avatar-url-cache";
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

type AvatarCacheEntry = {
  url: string;
  expiresAt: number;
};

const memoryCache = new Map<string, AvatarCacheEntry>();

/* ------------------ helpers ------------------ */

const loadFromSession = () => {
  if (typeof window === "undefined") return;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const parsed: Record<string, AvatarCacheEntry> = JSON.parse(raw);
    const now = Date.now();

    Object.entries(parsed).forEach(([key, entry]) => {
      if (entry.expiresAt > now) {
        memoryCache.set(key, entry);
      }
    });
  } catch {
    // ignore corrupt cache
  }
};

const saveToSession = () => {
  if (typeof window === "undefined") return;

  const obj: Record<string, AvatarCacheEntry> = {};
  memoryCache.forEach((value, key) => {
    obj[key] = value;
  });

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj));
};

let hydrated = false;

const ensureHydrated = () => {
  if (!hydrated) {
    loadFromSession();
    hydrated = true;
  }
};

/* ------------------ API ------------------ */

export const getCachedAvatarUrl = (key: string): string | null => {
  ensureHydrated();

  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    saveToSession();
    return null;
  }

  return entry.url;
};

export const setCachedAvatarUrl = (key: string, url: string) => {
  ensureHydrated();

  memoryCache.set(key, {
    url,
    expiresAt: Date.now() + TTL_MS,
  });

  saveToSession();
};

export const resetCachedAvatarUrl = (username: string, url?: string | null) => {
  ensureHydrated();
  if (!url) return;
  const cacheKeySmall = `${username}:${"small"}`;
  const cacheKeyMedium = `${username}:${"medium"}`;
  const cacheKeyLarge = `${username}:${"large"}`;
  [cacheKeySmall, cacheKeyMedium, cacheKeyLarge].forEach((key) => {
    memoryCache.set(key, {
      url,
      expiresAt: Date.now() + TTL_MS,
    });
  });

  saveToSession();
};
