"use client";

import { useState, useMemo } from "react";
import { Card, CardBody, Tabs, Tab, Chip, Divider } from "@heroui/react";
import {
  TrendingUp,
  History,
  ClipboardList,
  Plus,
  ChartCandlestick,
} from "lucide-react";
import { sdsApi } from "@/libs/sds";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import SCard from "@/components/ui/SCard";
import MarketStats from "@/components/market/MarketStats";
import MarketCandleChart from "@/components/market/MarketCandleChart";
import OrderBookTable from "@/components/market/OrderBookTable";
import OpenOrdersTable from "@/components/market/OpenOrdersTable";
import TradeHistoryTable from "@/components/market/TradeHistoryTable";
import TradeForm from "@/components/market/TradeForm";

export default function MarketPage() {
  const { data: session } = useSession();
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [selectedTab, setSelectedTab] = useState("buy");

  const { data: ticker, mutate: mutateTicker } = useSWR(
    "market-ticker",
    () => sdsApi.getTicker(),
    {
      refreshInterval: 5000,
    }
  );

  const { data: book, mutate: mutateBook } = useSWR(
    "market-orderbook",
    () => sdsApi.getOrderBook(30),
    {
      refreshInterval: 10000,
    }
  );

  const { data: openOrders, mutate: mutateOrders } = useSWR(
    session?.user?.name ? `market-open-orders-${session.user.name}` : null,
    () => sdsApi.getOpenOrders(session?.user?.name || ""),
    { refreshInterval: 15000 }
  );

  const { data: account } = useSWR(
    session?.user?.name ? `account-market-${session.user.name}` : null,
    () => sdsApi.getAccountExt(session?.user?.name || "")
  );

  const { data: history } = useSWR(
    "market-trade-history",
    () => sdsApi.getTradeHistory(40),
    {
      refreshInterval: 10000,
    }
  );

  const { data: marketHistory, mutate: mutateHistory } = useSWR(
    "market-history",
    () => sdsApi.getMarketHistory(3600, 24),
    {
      refreshInterval: 60000,
    }
  );

  const balances = useMemo(
    () => ({
      steem: account?.balance_steem || 0,
      sbd: account?.balance_sbd || 0,
    }),
    [account]
  );

  const refreshAll = () => {
    mutateTicker();
    mutateBook();
    mutateOrders();
    mutateHistory();
  };

  return (
    <div className="flex flex-col gap-6">
      <MarketStats ticker={ticker} volume={undefined} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Section: Chart & Lists */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          {/* Chart Area */}
          <Card className="card h-[450px] shadow-sm border border-divider overflow-hidden bg-content1">
            <CardBody className="p-0 overflow-hidden relative">
              <div className="absolute top-4 left-6 flex items-center gap-2 z-10 pointer-events-none">
                <TrendingUp size={18} className="text-primary" />
                <span className="font-bold text-sm tracking-tight opacity-70">
                  STEEM/SBD - 24H
                </span>
              </div>
              <MarketCandleChart data={marketHistory} />
            </CardBody>
          </Card>

          {/* Bottom Tabs */}
          <Card className="card flex-1 shadow-sm border border-divider bg-content1 min-h-[400px]">
            <CardBody>
              <Tabs
                aria-label="Market Data"
                classNames={{
                  panel: "p-0",
                }}
              >
                <Tab
                  key="book"
                  title={
                    <div className="flex items-center gap-2">
                      <ClipboardList size={18} />
                      <span>Order Book</span>
                    </div>
                  }
                >
                  <div className=" py-4 overflow-hidden">
                    <OrderBookTable
                      book={book}
                      onPriceClick={setSelectedPrice}
                    />
                  </div>
                </Tab>
                <Tab
                  key="orders"
                  title={
                    <div className="flex items-center gap-2">
                      <Plus size={18} />
                      <span>Open Orders</span>
                      {openOrders && openOrders.length > 0 && (
                        <Chip
                          size="sm"
                          color="primary"
                          variant="solid"
                          className="h-4 px-1 min-w-4 text-[10px]"
                        >
                          {openOrders.length}
                        </Chip>
                      )}
                    </div>
                  }
                >
                  <div className="h-[500px] overflow-auto scrollbar-hide">
                    <OpenOrdersTable
                      orders={openOrders}
                      onUpdate={refreshAll}
                    />
                  </div>
                </Tab>
                <Tab
                  key="history"
                  title={
                    <div className="flex items-center gap-2">
                      <History size={18} />
                      <span>Trade History</span>
                    </div>
                  }
                >
                  <TradeHistoryTable
                    history={history || []}
                    onPriceClick={setSelectedPrice}
                  />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Right Section: Trade Forms */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="card border border-divider bg-content1">
            <CardBody className="p-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase text-default-500 tracking-wider">
                Create Order
              </h3>
              <Divider />
              <Tabs
                aria-label="Trade Tabs"
                fullWidth
                size="lg"
                color={selectedTab === "buy" ? "success" : "danger"}
                selectedKey={selectedTab}
                onSelectionChange={(value) => setSelectedTab(value.toString())}
                classNames={{
                  panel: "p-0",
                }}
              >
                <Tab key="buy" title="Buy">
                  <TradeForm
                    type="buy"
                    ticker={ticker}
                    selectedPrice={selectedPrice}
                    balances={balances}
                    onSuccess={refreshAll}
                  />
                </Tab>
                <Tab key="sell" title="Sell">
                  <TradeForm
                    type="sell"
                    ticker={ticker}
                    selectedPrice={selectedPrice}
                    balances={balances}
                    onSuccess={refreshAll}
                  />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          <Card className="shadow-sm border border-divider bg-content1/50">
            <CardBody className="p-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase text-default-500 tracking-wider">
                Trading Info
              </h3>
              <Divider />
              <ul className="text-xs space-y-3 opacity-80">
                <li className="flex justify-between">
                  <span>Market Fee</span>
                  <span className="font-bold text-success">0.00%</span>
                </li>
                <li className="flex justify-between">
                  <span>Order Type</span>
                  <span className="font-bold">LImit (Default)</span>
                </li>
                <li className="flex justify-between">
                  <span>Pair</span>
                  <span className="font-bold">STEEM / SBD</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
