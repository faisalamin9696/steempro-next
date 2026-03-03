"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Box, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalProps } from "./useExplorerData";

export default function ExplorerBlockSearch() {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const { data: globalData } = useGlobalProps();
  const headBlock = globalData?.globals.head_block_number ?? 0;

  const handleSearch = () => {
    const num = parseInt(searchInput.trim());
    if (!isNaN(num) && num > 0) {
      router.push(`/explorer/block/${num}`);
    }
  };

  const goLatest = () => {
    if (headBlock > 0) router.push(`/explorer/block/${headBlock}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            isClearable
            placeholder="Enter block number..."
            value={searchInput}
            onValueChange={setSearchInput}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            startContent={<Search size={16} className="text-default-400" />}
            radius="lg"
            classNames={{
              inputWrapper:
                "bg-white/50 dark:bg-content1/30 border-default-200 dark:border-default-200/50 hover:border-primary/50 transition-colors",
            }}
          />
        </div>
        <Button
          color="primary"
          variant="flat"
          radius="lg"
          onPress={handleSearch}
          className="font-semibold"
        >
          Go
        </Button>
        <Button
          variant="flat"
          radius="lg"
          onPress={goLatest}
          className="font-semibold"
        >
          Latest
        </Button>
      </div>

      {/* Empty state */}
      <Card
        className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
        shadow="none"
      >
        <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="p-4 rounded-2xl bg-primary/5">
            <Box size={40} className="text-primary/30" />
          </div>
          <p className="text-default-500 dark:text-default-400 text-sm text-center max-w-sm">
            Enter a block number to view its details, or click
            &quot;Latest&quot; to see the most recent block.
          </p>
          {headBlock > 0 && (
            <p className="text-xs text-default-400 font-mono">
              Head block: #{headBlock.toLocaleString()}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
