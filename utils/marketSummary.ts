/**
 * Pure market-history summarizer shared by the explorer's server-rendered
 * overview (24h snapshot) and the client Activity tab (range-aware cards).
 *
 * One implementation ⇒ the headline number and the chart can never disagree.
 * Fields are optional-tolerant so it accepts any `get_market_history` mapping.
 */

export interface MarketBucket {
  time: number;
  open_steem?: number;
  open_sbd?: number;
  high_steem?: number;
  high_sbd?: number;
  low_steem?: number;
  low_sbd?: number;
  close_steem?: number;
  close_sbd?: number;
  steem_volume?: number;
  sbd_volume?: number;
}

export interface MarketSummary {
  /** STEEM price in SBD/USD terms: close_sbd / close_steem of the last trade bucket. */
  price: number;
  /** % change first → last valid bucket within the window. */
  changePct: number;
  high: number;
  low: number;
  volumeSteem: number;
  volumeSbd: number;
  /** number of priced buckets that went into the summary (0 = no trades) */
  buckets: number;
  hours: number;
}

const n = (v: number | undefined): number =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

export function summarizeMarket(
  history: MarketBucket[],
  hours: number,
): MarketSummary {
  const empty: MarketSummary = {
    price: 0,
    changePct: 0,
    high: 0,
    low: 0,
    volumeSteem: 0,
    volumeSbd: 0,
    buckets: 0,
    hours,
  };

  const rows = Array.isArray(history) ? history : [];
  if (rows.length === 0) return empty;

  // Price/high/low only from buckets where both sides traded (a zero side
  // would make the ratio meaningless).
  const priced = rows.filter((m) => n(m.close_steem) > 0 && n(m.close_sbd) > 0);
  if (priced.length === 0) return empty;

  const ratio = (m: MarketBucket, side: "close" | "high" | "low"): number => {
    const s = n(m[`${side}_steem` as const]);
    const b = n(m[`${side}_sbd` as const]);
    return s > 0 && b > 0 ? b / s : 0;
  };

  const ratios = priced.map((m) => ratio(m, "close")).filter((r) => r > 0);
  const highs = priced.map((m) => ratio(m, "high")).filter((r) => r > 0);
  const lows = priced.map((m) => ratio(m, "low")).filter((r) => r > 0);

  const first = ratios[0];
  const last = ratios[ratios.length - 1];

  return {
    price: last,
    changePct: first > 0 ? ((last - first) / first) * 100 : 0,
    high: highs.length ? Math.max(...highs) : last,
    low: lows.length ? Math.min(...lows) : last,
    volumeSteem: rows.reduce((sum, m) => sum + n(m.steem_volume), 0),
    volumeSbd: rows.reduce((sum, m) => sum + n(m.sbd_volume), 0),
    buckets: priced.length,
    hours,
  };
}
