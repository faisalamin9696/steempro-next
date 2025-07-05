import { useRecentTrades } from "@/hooks/useRecentTrades";
import { Card, CardBody, CardHeader } from "@heroui/card";
import React, { memo, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Button } from "@heroui/button";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import TimeAgoWrapper from "../wrappers/TimeAgoWrapper";
import moment from "moment";

const RecentTrades = memo(() => {
  const { trades, isLoading, error } = useRecentTrades();
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  // Memoize the paginated trades
  const paginatedData = useMemo(() => {
    const indexOfLastTrade = currentPage * tradesPerPage;
    const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
    const currentTrades = trades.slice(indexOfFirstTrade, indexOfLastTrade);
    const totalPages = Math.ceil(trades.length / tradesPerPage);

    return {
      currentTrades: currentTrades.map((trade, index) => {
        const time = new Date(trade.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        return {
          ...trade,
          time,
          key: `${trade.timestamp}-${index}`, // Stable key for React
        };
      }),
      totalPages,
    };
  }, [trades, currentPage, tradesPerPage]);

  const handleNextPage = () => {
    if (currentPage < paginatedData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardBody>Recent Trades</CardBody>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading trades...</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardBody>Recent Trades</CardBody>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">⚠️</span>
              </div>
              <p className="text-destructive text-sm font-medium">
                Failed to load trades
              </p>
              <p className="text-muted-foreground text-xs mt-1">{error}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (
    !paginatedData.currentTrades ||
    paginatedData.currentTrades.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardBody>Recent Trades</CardBody>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">📊</span>
              </div>
              <p className="text-muted-foreground text-sm">No recent trades</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Check back later for trading activity
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardBody className="text-default-700 flex flex-row text-lg sm:text-xl items-center gap-2">
          Recent Trades
        </CardBody>
        <CardBody className="text-gray-400 text-sm sm:text-base text-end">
          Latest STEEM/SBD market trades
        </CardBody>
      </CardHeader>
      <CardBody className="p-0">
        <Table className="mb-4">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-xs p-2">Time</TableHead>
              <TableHead className="text-xs p-2">Type</TableHead>
              <TableHead className="text-xs p-2">Price (SBD)</TableHead>
              <TableHead className="text-xs p-2">Amount (STEEM)</TableHead>
              <TableHead className="text-xs p-2">Total (SBD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.currentTrades.map((trade) => (
              <TableRow key={trade.key} className="text-xs hover:bg-muted/20 p-4">
                <TableCell className="p-3 font-mono text-muted-foreground">
                  <TimeAgoWrapper
                    created={moment(trade.timestamp).toLocaleString()}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === "buy"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {trade.type.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell
                  className={`p-2 font-mono ${
                    trade.type === "buy" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trade.price.toFixed(6)}
                </TableCell>
                <TableCell className="p-2 font-mono">
                  {trade.amount.toLocaleString()}
                </TableCell>
                <TableCell className="p-2 font-mono">
                  {trade.total.toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {paginatedData.totalPages > 1 && (
          <div className="flex items-center justify-between pb-4 px-3">
            <Button
              variant="bordered"
              size="sm"
              onPress={handlePrevPage}
              isDisabled={currentPage === 1}
              className="flex items-center space-x-2"
              startContent={<BiChevronLeft size={18} />}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {paginatedData.totalPages}
            </div>

            <Button
              variant="bordered"
              size="sm"
              onPress={handleNextPage}
              isDisabled={currentPage === paginatedData.totalPages}
              className="flex items-center space-x-2"
              endContent={<BiChevronRight size={18} />}
            >
              Next
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
});

export default RecentTrades;
