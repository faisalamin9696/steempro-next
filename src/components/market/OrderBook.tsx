import { useAppSelector } from "@/constants/AppFunctions";
import { useOrderBook } from "@/hooks/useOrderBook";
import { Card, CardBody } from "@heroui/card";
import { useSession } from "next-auth/react";
import React from "react";
import { useTranslation } from "@/utils/i18n";

interface MarketOrderBook {
  bids: Array<{
    order_price: {
      base: { amount: string; precision: number; nai: string };
      quote: { amount: string; precision: number; nai: string };
    };
    real_price: string;
    created: string;
  }>;
  asks: Array<{
    order_price: {
      base: { amount: string; precision: number; nai: string };
      quote: { amount: string; precision: number; nai: string };
    };
    real_price: string;
    created: string;
  }>;
}

interface Props {
  orderBook?: MarketOrderBook;
  onClick?: (price: string) => void;
}
function OrderBook(props: Props) {
  const { t } = useTranslation();
  const { onClick } = props;
  const { orderBookData: orderBook } = useOrderBook();
  const openOrders = useAppSelector((state) => state.openOrdersReducer.value);

  // Separate user order prices by side
  const userSellPrices = new Set<string>();
  const userBuyPrices = new Set<string>();

  openOrders?.forEach((order) => {
    const baseAsset = order.raw_price.base.split(" ")[1];

    if (baseAsset === "STEEM") {
      const price =
        parseFloat(order.raw_price.quote) / parseFloat(order.raw_price.base);
      const fixedPrice = price.toFixed(6);

      userSellPrices.add(fixedPrice); // Sell order
    } else {
      const price =
        parseFloat(order.raw_price.base) / parseFloat(order.raw_price.quote);
      const fixedPrice = price.toFixed(6);
      userBuyPrices.add(fixedPrice); // Buy order
    }
  });

  // Sort and limit orders for display - increased to 12 each
  const sellOrders = orderBook?.asks
    ?.sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 10)
    .reverse();

  const buyOrders = orderBook?.bids
    ?.sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="text-red-600 text-base font-semibold">
          {t("market.sell_orders")}
        </CardBody>
        <CardBody>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 pb-2 border-b border-default-900/20">
              <span>{t("market.price_sbd")}</span>
              <span className="text-right">{t("market.steem")}</span>
              <span className="text-right">{t("market.sbd")}</span>
            </div>
            {sellOrders?.map((order, index) => {
              const isUserSellOrder = userSellPrices.has(
                Number(order.price).toFixed(6)
              );

              return (
                <div
                  onClick={() => {
                    onClick?.(order.price?.toString());
                  }}
                  key={index}
                  className="font-mono cursor-pointer grid grid-cols-3 gap-2 text-xs px-1 py-1 hover:bg-red-500/30 rounded"
                >
                  <div className="flex items-center text-red-600 font-medium gap-2">
                    {isUserSellOrder && (
                      <div className="w-[6px] h-[6px] rounded-full bg-red-500" />
                    )}
                    {order.price?.toFixed(6)}
                  </div>

                  <span className="text-right text-default-800">
                    {order.steem}
                  </span>
                  <span className="text-right text-default-600">
                    {order.sbd}
                  </span>
                </div>
              );
            }) || (
              <div className="text-center text-gray-500 py-4">
                {t("market.loading_sell_orders")}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className=" text-green-600 text-base font-semibold">
          {t("market.buy_orders")}
        </CardBody>
        <CardBody>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 pb-2 border-b border-default-900/20">
              <span>{t("market.price_sbd")}</span>
              <span className="text-right">{t("market.steem")}</span>
              <span className="text-right">{t("market.sbd")}</span>
            </div>
            {buyOrders?.map((order, index) => {
              const isUserBuyOrder = userBuyPrices.has(
                Number(order.price).toFixed(6)
              );
              return (
                <div
                  onClick={() => {
                    onClick?.(order.price?.toString());
                  }}
                  key={index}
                  className="font-mono cursor-pointer grid grid-cols-3 gap-2 text-xs px-1 py-1 hover:bg-green-500/30 rounded"
                >
                  <div className="flex items-center text-green-600 font-medium gap-2">
                    {isUserBuyOrder && (
                      <div className="w-[6px] h-[6px] rounded-full bg-green-500" />
                    )}
                    {order.price?.toFixed(6)}
                  </div>
                  <span className="text-right text-default-800">
                    {order.steem}
                  </span>
                  <span className="text-right text-default-600">
                    {order.sbd}
                  </span>
                </div>
              );
            }) || (
              <div className="text-center text-gray-500 py-4">
                {t("market.loading_buy_orders")}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default OrderBook;
