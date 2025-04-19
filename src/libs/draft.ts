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

export function saveCommentDraft(linkId: number, markdown: string) {
  const existing = Cookies.get("comment_drafts");
  const drafts = existing
    ? (JSON.parse(existing) as Record<number, CommentDraft>)
    : {};

  drafts[linkId] = { markdown };

  if (linkId && markdown)
    Cookies.set("comment_drafts", JSON.stringify(drafts), {
      expires: 7, // Cookie itself expires in 7 days
      secure: true,
      sameSite: "strict",
    });
}

export function getCommentDraft(linkId: number) {
  const existing = Cookies.get("comment_drafts");
  if (!existing) return { markdown: "" };

  const drafts = JSON.parse(existing) as Record<number, CommentDraft>;
  const draft = drafts[linkId];

  return { markdown: draft?.markdown || "" };
}

export function savePostDraft(
  title: string,
  markdown: string,
  tags: string,
  beneficiaries: Beneficiary[],
  community?: Community
) {
  //   const draft = existing
  //     ? (JSON.parse(existing) as PostDraft)
  //     : {
  //         title: "",
  //         markdown: "",
  //         tags: "",
  //         beneficiaries: [],
  //         community: undefined,
  //       };

  Cookies.set(
    "post_draft",
    JSON.stringify({
      title,
      markdown,
      tags,
      beneficiaries,
      community,
    }),
    {
      expires: 7, // Cookie itself expires in 7 days
      secure: true,
      sameSite: "strict",
    }
  );
}

export function getPostDraft() {
  const existing = Cookies.get("post_draft");
  if (!existing)
    return {
      title: "",
      markdown: "",
      tags: "",
      beneficiaries: [],
      community: undefined,
    };

  const draft = JSON.parse(existing) as PostDraft;

  return draft;
}
