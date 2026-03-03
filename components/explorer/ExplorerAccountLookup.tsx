"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { User, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExplorerAccountLookup() {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const username = searchInput.trim().toLowerCase().replace("@", "");
    if (username) router.push(`/explorer/account/${username}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            isClearable
            placeholder="Search Steem account (e.g. steemit)"
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
          Lookup
        </Button>
      </div>

      {/* Empty state */}
      <Card
        className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
        shadow="none"
      >
        <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="p-4 rounded-2xl bg-primary/5">
            <User size={40} className="text-primary/30" />
          </div>
          <p className="text-default-500 dark:text-default-400 text-sm text-center max-w-sm">
            Enter a Steem username to view detailed account information,
            balances, voting power, and activity stats.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
