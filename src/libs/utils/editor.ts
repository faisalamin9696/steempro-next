import getSlug from "speakingurl";
import { diff_match_patch as diffMatchPatch } from "diff-match-patch";
import { secureDecrypt } from "./encryption";

const MAX_TAGS = 8;

export const getWordsCount = (text) =>
  text && typeof text === "string"
    ? text.replace(/^\s+|\s+$/g, "").split(/\s+/).length
    : 0;

const app = `steempro/${0.1}`;

export const generateRndStr = () =>
  (Math.random() + 1).toString(16).substring(2);

export const generatePermlink = (title, random = false) => {
  if (!title) {
    return "";
  }

  // TODO: check special character processing
  const slug = getSlug(title);
  let perm = slug && slug.toString();

  if (title) {
    // make shorter url if possible
    const shortp = perm.split("-");
    if (shortp.length > 5) {
      perm = shortp.slice(0, 5)?.join("-");
    }

    if (random) {
      const rnd = generateRndStr();
      perm = `${perm}-${rnd}`;
    }

    // STEEMIT_MAX_PERMLINK_LENGTH
    if (perm.length > 255) {
      perm = perm.substring(perm.length - 255, perm.length);
    }

    // only letters numbers and dashes
    perm = perm?.toLowerCase().replace(/[^a-z0-9-]+/g, "");

    if (perm.length === 0) {
      return generateRndStr();
    }
  }

  return perm;
};

export const extractWordAtIndex = (text: string, index: number) => {
  const RANGE = 50;

  const _start = index - RANGE;
  const _end = index + RANGE;

  const _length = text.length;

  const textChunk = text.substring(
    _start > 0 ? _start : 0,
    _end < _length ? _end : _length
  );
  const indexChunk =
    index < 50
      ? index
      : _length - index < 50
      ? textChunk.length - (_length - index)
      : RANGE;

  const END_REGEX = /[\s,]/;
  let word = "";
  for (
    let i = indexChunk;
    i >= 0 && (!END_REGEX.test(textChunk[i]) || i === indexChunk);
    i--
  ) {
    if (textChunk[i]) {
      word += textChunk[i];
    }
  }
  word = word.split("")?.reverse()?.join("");

  if (!END_REGEX.test(textChunk[indexChunk])) {
    for (
      let i = indexChunk + 1;
      i < textChunk.length && !END_REGEX.test(textChunk[i]);
      i++
    ) {
      if (textChunk[i]) {
        word += textChunk[i];
      }
    }
  }

  return word;
};

export const generateReplyPermlink = (toAuthor: string) => {
  if (!toAuthor) {
    return "";
  }

  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(
    t.getMonth() + 1
  ).toString()}${t.getDate().toString()}t${t.getHours().toString()}${t
    .getMinutes()
    .toString()}${t.getSeconds().toString()}${t.getMilliseconds().toString()}z`;

  return `re-${toAuthor.replace(/\./g, "")}-${timeFormat}`;
};

export const makeOptions = (postObj) => {
  if (!postObj.author || !postObj.permlink) {
    return {};
  }

  const a: any = {
    allow_curation_rewards: true,
    allow_votes: true,
    author: postObj.author,
    permlink: postObj.permlink,
    max_accepted_payout: "1000000.000 SBD",
    percent_steem_dollars: 10000,
    extensions: [],
  };
  switch (postObj.operationType) {
    case 100:
      a.max_accepted_payout = "1000000.000 SBD";
      a.percent_steem_dollars = 0;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) =>
          a.account.localeCompare(b.account)
        );
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    case 0:
      a.max_accepted_payout = "0.000 SBD";
      a.percent_steem_dollars = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) =>
          a.account.localeCompare(b.account)
        );
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    default:
      a.max_accepted_payout = "1000000.000 SBD";
      a.percent_steem_dollars = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) =>
          a.account.localeCompare(b.account)
        );
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;
  }

  return a;
};

export const makeJsonMetadataReply = () => ({
  app: app,
  format: "markdown+html",
});

export const makeJsonMetadata = (meta, tags) =>
  Object.assign({}, meta, {
    tags,
    app: app,
    format: "markdown+html",
  });

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const mergedMeta = Object.assign({}, oldJson, meta);
  return Object.assign({}, oldJson, mergedMeta, {
    tags,
    app: app,
    format: "markdown+html",
  });
};

export const extractMetadata = (body: string) => {
  const urlReg =
    /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out: any = {
    links: [],
    image: [],
    users: [],
  };

  const mUrls = body && body.match(urlReg);
  const mUsers = body && body.match(userReg);

  const matchedImages: any[] = [];
  const matchedLinks: any[] = [];
  const matchedUsers: any[] = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }
  if (matchedImages.length) {
    out.image = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i]?.trim()?.substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};
export const createPatch = (text1, text2) => {
  if (!text1 && text1 === "") {
    return undefined;
  }

  const dmp = new diffMatchPatch();
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);
  return patch;
};

export const validateCommentBody = (
  body: string,
  isStory: boolean
): true | string => {
  const maxKb = isStory ? 64 : 16;
  const maxLength = maxKb * 1024;
  if (new Blob([body]).size >= maxKb * 1024 - 256) {
    return `Exceeds maximum length (${maxKb}KB)`;
  }

  return true;
};

export function getEditorDraft() {
  const draftString = secureDecrypt(
    localStorage.getItem("@secure.j.post_draft") ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );
  const draft = JSON.parse(draftString || `{}`) as {
    title: string;
    markdown: string;
    tags: string;
    beneficiaries: Beneficiary[];
    community: Community;
  };

  return draft;
}

export function validateTagInput(value) {
  const cats = value.trim().replace(/#/g, "").split(/ +/);

  return cats.length > MAX_TAGS
    ? `Please use only ${MAX_TAGS} tags`
    : cats.find((c) => c.length > 24)
    ? `Maximum tag length is 24 characters`
    : cats.find((c) => c.split("-").length > 2)
    ? `Use only one dash in tag`
    : cats.find((c) => c.indexOf(",") >= 0)
    ? `Use spaces to separate tags`
    : cats.find((c) => /[A-Z]/.test(c))
    ? `Use only lowercase letters in tags`
    : cats.find((c) => !/^[a-z0-9-#]+$/.test(c))
    ? `Use only lowercase letters, digits and one dash in tags`
    : cats.find((c) => !/^[a-z-#]/.test(c))
    ? `Tag must start with a letter`
    : cats.find((c) => !/[a-z0-9]$/.test(c))
    ? `Tag must end with a letter or number`
    : cats.filter((c) => c.substring(0, 5) === "hive-").length >= 1
    ? `Post already has community tag by default, please do not include another 'hive-' tag.`
    : null;
}
