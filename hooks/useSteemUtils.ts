import { useAppSelector } from "./redux/store";

export const useSteemUtils = () => {
  const globalProps = useAppSelector((state) => state.globalPropsReducer.value);

  const vestsToSteem = (vests: number | string): number => {
    const v = Number(vests);
    const s = globalProps?.steem_per_share;
    if (!v || !s || isNaN(v) || isNaN(s)) return 0;
    return v * s;
  };

  const steemToVests = (steem: number | string): number => {
    const st = Number(steem);
    const s = globalProps?.steem_per_share;
    if (!st || !s || isNaN(st) || isNaN(s)) return 0;
    return st / s;
  };

  return {
    vestsToSteem,
    steemToVests,
    globalProps,
  };
};
