"use client";

import DepthChart from "@/components/market/DepthChart";
import MarketStats from "@/components/market/MarketStats";
import MarketTrade from "@/components/market/MarketTrade";
import OpenOrders from "@/components/market/OpenOrders";
import OrderBook from "@/components/market/OrderBook";
import RecentTrades from "@/components/market/RecentTrades";
import { useMarketData } from "@/hooks/useMarketData";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import React, { useState } from "react";

function MarketPage() {
  const [price, setPrice] = useState("");
  const { ticker } = useMarketData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 py-4">
      <MarketStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[419px] p-4">
            <DepthChart />
          </Card>
          <MarketTrade ticker={ticker} markPrice={price} />
        </div>

        <OrderBook
          onClick={(price) => {
            setPrice(price);
          }}
        />
      </div>

      <div>
        
         <Popover
                    isOpen={isOpen}
                    onOpenChange={(open) => setIsOpen(open)}
                  >
                    <PopoverTrigger>
                      <Button>Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="px-1 py-2">
                        <div className="text-small font-bold">
                          Popover Content
                        </div>
                        <div className="text-tiny">
                          This is the popover content
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
        <OpenOrders />
      </div>

      <RecentTrades />
    </div>
  );
}

export default MarketPage;
