import { Chip } from "@heroui/chip";
import moment from "moment";
import { ColumnDef, DataTable } from "../ui/data-table";
import { useTranslations } from "next-intl";

const TradeHistoryTable = ({
  history,
  onPriceClick,
}: {
  history: MarketTrade[];
  onPriceClick: (price: number) => void;
}) => {
  const t = useTranslations("Market.history");
  const tTrade = useTranslations("Market.trade");

  const historyColumns: ColumnDef<MarketTrade>[] = [
    {
      key: "data",
      header: t("date"),
      render: (_info, order) => {
        const isBuying = order.current_pays.includes("SBD");
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              variant="flat"
              radius="sm"
              size="sm"
              color={isBuying ? "success" : "danger"}
            >
              {isBuying ? tTrade("buy") : tTrade("sell")}
            </Chip>
            <p className="text-xs text-muted">
              {moment.unix(order.date).format("DD MMM HH:mm")}
            </p>
          </div>
        );
      },
    },

    {
      key: "price",
      header: t("price"),
      className: "text-mono",
      render: (_info, trade) => {
        const isSell = trade.current_pays.includes("STEEM");
        const price =
          parseFloat(trade.open_pays) / parseFloat(trade.current_pays) || 0;

        return price.toFixed(6);
      },
    },
    {
      key: "steem",
      header: t("steem"),
      render: (_info, trade) => {
        return trade.current_pays.split(" ")[0];
      },
    },
  ];

  return <DataTable data={history} columns={historyColumns} />;
};

export default TradeHistoryTable;
