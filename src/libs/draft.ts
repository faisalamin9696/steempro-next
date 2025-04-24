import Cookies from "js-cookie";

type CommentDraft = {
  markdown: string;
};

type PostDraft = {
  title: string;
  markdown: string;
  tags: string;
  beneficiaries: Beneficiary[];
  community?: Community;
};

export function savePostDraft(
  title: string,
  markdown: string,
  tags: string,
  beneficiaries: Beneficiary[],
  community?: Community
) {
  localStorage.setItem(
    "post_draft",
    JSON.stringify({
      title,
      markdown,
      tags,
      beneficiaries,
      community,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    })
  );
}

export function getPostDraft(): PostDraft {
  const empty_draft = {
    title: "",
    markdown: "",
    tags: "",
    beneficiaries: [],
    community: undefined,
  };
  const raw = localStorage.getItem("post_draft");
  if (!raw) return empty_draft;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem("post_draft");
      return empty_draft;
    }
    return parsed;
  } catch {
    return empty_draft;
  }
}

export function saveCommentDraft(linkId: number, markdown: string) {
  const existing = localStorage.getItem("comment_drafts");
  const drafts = existing
    ? (JSON.parse(existing) as Record<
        number,
        { markdown: string; expiresAt: number }
      >)
    : {};

  if (linkId && markdown) {
    drafts[linkId] = {
      markdown,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in 7 days
    };

    localStorage.setItem("comment_drafts", JSON.stringify(drafts));
  }
}

export function getCommentDraft(linkId: number) {
  const existing = localStorage.getItem("comment_drafts");
  if (!existing) return { markdown: "" };

  const drafts = JSON.parse(existing) as Record<
    number,
    { markdown: string; expiresAt: number }
  >;
  const draft = drafts[linkId];
  if (!draft) return { markdown: "" };

  return { markdown: draft.markdown };
}

export function cleanupCommentDrafts() {
  const existing = localStorage.getItem("comment_drafts");
  if (!existing) return;

  const drafts = JSON.parse(existing) as Record<
    number,
    { markdown: string; expiresAt: number }
  >;
  const now = Date.now();

  for (const key in drafts) {
    if (drafts[key].expiresAt < now) {
      delete drafts[key];
    }
  }

  localStorage.setItem("comment_drafts", JSON.stringify(drafts));
}
