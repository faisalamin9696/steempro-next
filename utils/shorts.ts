import { Constants } from "@/constants";

/**
 * Resolves the playable URL for a SteemPro short from its `json_metadata`.
 *
 * Lives outside `app/shorts/page.tsx` because that file is a client module —
 * importing it from a server component (to build `VideoObject` JSON-LD, for
 * example) is not allowed.
 */
export function extractVideoUrl(post: Feed): string | undefined {
  try {
    const meta = JSON.parse(post.json_metadata || "{}");
    if (!meta?.video) return undefined;
    const v =
      typeof meta.video === "string"
        ? meta.video
        : Array.isArray(meta.video)
          ? meta.video[0]
          : null;
    if (!v) return undefined;

    if (v.startsWith("http")) return v;

    const baseGateway = Constants.ipfs_gateway;
    if (meta?.isHls) {
      return `${baseGateway}/ipfs/${v}/master.m3u8`;
    }

    return `${baseGateway}/ipfs/${v}`;
  } catch {
    return undefined;
  }
}
