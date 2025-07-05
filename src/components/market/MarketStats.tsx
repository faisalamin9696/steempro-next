import { useMarketData } from "@/hooks/useMarketData";
import { Card, CardBody } from "@heroui/card";
import React from "react";
import {
  BiTrendingUp,
  BiTrendingDown,
  BiDollar,
  BiBarChart,
} from "react-icons/bi";

function MarketStats() {
  const { ticker, volume, isLoading, error } = useMarketData();
  const percentChange = ticker?.percent_change
    ? parseFloat(ticker.percent_change)
    : 0;

  const steemVolume = volume?.steem_volume.amount || "0";
  const sbdVolume = volume?.sbd_volume.amount || "0";

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-gray-200/20 shadow-sm">
              <CardBody className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="border border-red-200 shadow-sm">
          <CardBody className="p-4">
            <div className="text-center text-red-600">
              <p>Error loading market data</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check console for details
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-gray-200/20 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                STEEM Price
              </p>
              <p
                className="text-lg sm:text-2xl font-bold"
                style={{ color: "#07d7a9" }}
              >
                {parseFloat(ticker?.latest || "0")?.toFixed(6)} SBD
              </p>
            </div>
            {percentChange >= 0 ? (
              <BiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            ) : (
              <BiTrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            )}
          </div>
          <p
            className={`text-xs mt-1 ${
              percentChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(2)}% (24h)
          </p>
        </CardBody>
      </Card>

      <Card className="border border-gray-200/20 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Spread
              </p>
              <p className="text-lg sm:text-2xl font-bold text-default-700">
                {ticker
                  ? (
                      ((parseFloat(ticker.lowest_ask) -
                        parseFloat(ticker.highest_bid)) *
                        100) /
                      parseFloat(ticker.highest_bid)
                    ).toFixed(2)
                  : "0.00"}
                %
              </p>
            </div>
            <BiDollar
              className="w-6 h-6 sm:w-8 sm:h-8"
              style={{ color: "#07d7a9" }}
            />
          </div>
          <p className="text-xs text-default-500 mt-1">
            Bid: {parseFloat(ticker?.highest_bid || "0")?.toFixed(6)} SBD
          </p>
        </CardBody>
      </Card>

      <Card className="border border-gray-200/20 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                24h Volume
              </p>
              <p className="text-lg sm:text-2xl font-bold text-default-700">
                {steemVolume} STEEM
              </p>
            </div>
            <BiBarChart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
          <p className="text-xs text-default-500 mt-1">{sbdVolume} SBD</p>
        </CardBody>
      </Card>

      <Card className=" border border-gray-200/20 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Ask Price
              </p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                {parseFloat(ticker?.lowest_ask || "0")?.toFixed(6)} SBD
              </p>
            </div>
            <CardBody className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <p className="text-xs text-default-500 mt-1">Lowest sell order</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default MarketStats;
