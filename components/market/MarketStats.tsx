import { TrendingUp, TrendingDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";

const MarketStats = ({
  ticker,
  volume,
}: {
  ticker: MarketTicker | undefined;
  volume: any | undefined;
}) => {
  const t = useTranslations("Market.stats");
  if (!ticker) return null;

  const isPositive = ticker.percent_change >= 0;

  return (
    <div className="card grid grid-cols-2 lg:grid-cols-6 gap-4 p-4 rounded-2xl border border-divider shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("lastPrice")}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={twMerge(
              "text-xl font-black",
              isPositive ? "text-success" : "text-danger",
            )}
          >
            {ticker.latest.toFixed(6)}
          </span>
          {isPositive ? (
            <TrendingUp size={16} className="text-success" />
          ) : (
            <TrendingDown size={16} className="text-danger" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("change24h")}
        </span>
        <span
          className={twMerge(
            "text-lg font-bold",
            isPositive ? "text-success" : "text-danger",
          )}
        >
          {ticker.percent_change.toFixed(2)}%
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("high24h")}
        </span>
        <span className="text-lg font-bold text-success">
          {ticker.latest > 0
            ? (
                ticker.latest * (1 + Math.abs(ticker.percent_change / 100))
              ).toFixed(6)
            : "--"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("low24h")}
        </span>
        <span className="text-lg font-bold text-danger">
          {ticker.latest > 0
            ? (
                ticker.latest * (1 - Math.abs(ticker.percent_change / 100))
              ).toFixed(6)
            : "--"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("volumeSteem")}
        </span>
        <span className="text-lg font-bold">
          {ticker.steem_volume.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          {t("volumeSbd")}
        </span>
        <span className="text-lg font-bold">
          {ticker.sbd_volume.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
