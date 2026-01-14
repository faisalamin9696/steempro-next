export const formatVests = (vests: number): string => {
  if (vests >= 1000000) {
    return (vests / 1000000).toFixed(2) + "M";
  } else if (vests >= 1000) {
    return (vests / 1000).toFixed(2) + "K";
  }
  return vests.toFixed(2);
};

export const scrollToWithOffset = (el: HTMLElement, offset: number = 0) => {
  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
};

export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(
        reader?.result?.toString().replace(/^data:image\/?[A-z]*;base64,/, "")
      );
    };
    reader.onerror = (error) => reject(error);
  });
export const count_words = (text: string) => {
  if (text) {
    return text.match(/\S+/g)?.length;
  } else return 0;
};
export const calculateVoteValue = (
  account: AccountExt,
  weight: number,
  fund_per_rshare: number,
  median_price: number,
  isDownvote: boolean = false
): number => {
  const totalVests = account.vests_own + account.vests_in - account.vests_out;
  const vp = isDownvote
    ? account.downvote_mana_percent
    : account.upvote_mana_percent;

  if (!totalVests || !fund_per_rshare || !median_price) return 0;
  const power = vp / 50;
  const final_vest = totalVests * 1e6;
  const rshares = (power * final_vest) / 100;
  const full_vote_value =
    (rshares * fund_per_rshare * median_price * weight) / 100;

  return full_vote_value || 0;
};
