export const vestToSteem = (
  rewards_vests: number = 0,
  steem_per_share: number
): number => {
  return rewards_vests * steem_per_share;
};

export const steemToVest = (steem: number, steem_per_share: number): number => {
  return steem / steem_per_share;
};

export const vestsToRshares = (
  vests: number,
  votingPower: number,
  votePerc: number
): number => {
  const vestingShares = vests * 1e6;
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;
  return (power * vestingShares) / 1e4;
};
