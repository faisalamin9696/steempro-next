"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  ArrowLeft,
  User,
} from "lucide-react";
import { condenserApi, SteemBlock } from "@/libs/consenser";
import { motion } from "framer-motion";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import { useGlobalProps } from "@/components/explorer/useExplorerData";
import PageHeader from "@/components/ui/PageHeader";

export default function BlockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blockNum = Number(params.block_num);

  const [block, setBlock] = useState<SteemBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: globalData } = useGlobalProps();
  const headBlock = globalData?.globals.head_block_number ?? 0;

  const fetchBlock = useCallback(async (num: number) => {
    if (num <= 0) return;
    setLoading(true);
    setError("");
    try {
      const b = await condenserApi.getBlock(num);
      if (!b) throw new Error("Block not found");
      setBlock(b);
    } catch (err: any) {
      setError(err.message || "Failed to fetch block");
      setBlock(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (blockNum > 0) fetchBlock(blockNum);
  }, [blockNum, fetchBlock]);

  const navigate = (num: number) => router.push(`/explorer/block/${num}`);

  const truncHash = (hash: string) =>
    hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : "";

  return (
    <div className="space-y-6 pb-20">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button
          onPress={() => {
            window?.history?.back();
          }}
          variant="flat"
          radius="lg"
          size="sm"
          isIconOnly
        >
          <ArrowLeft size={16} />
        </Button>
        <PageHeader
          title={`Block #${blockNum.toLocaleString()}`}
          description="Steem blockchain block details"
          icon={Box}
          color="primary"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          isDisabled={blockNum <= 1}
          onPress={() => navigate(blockNum - 1)}
          startContent={<ChevronLeft size={16} />}
        >
          Previous
        </Button>
        <Chip
          variant="flat"
          color="primary"
          classNames={{
            base: "border border-primary/20",
            content: "font-bold font-mono text-sm",
          }}
        >
          #{blockNum.toLocaleString()}
        </Chip>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          isDisabled={blockNum >= headBlock}
          onPress={() => navigate(blockNum + 1)}
          endContent={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {error && (
        <Card className="bg-danger/10 border border-danger/20" shadow="none">
          <CardBody className="text-danger text-sm p-4">{error}</CardBody>
        </Card>
      )}

      {/* Block Details */}
      {block && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Box size={18} />
                </div>
                <h3 className="font-bold text-lg">Block Info</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <InfoRow
                label="Block ID"
                value={truncHash(block.block_id)}
                copyText={block.block_id}
              />
              <InfoRow
                label="Timestamp"
                value={new Date(block.timestamp + "Z").toLocaleString()}
                icon={<Clock size={14} className="text-default-400" />}
              />
              <InfoRow
                label="Witness"
                value={block.witness}
                icon={<User size={14} className="text-default-400" />}
                isLink
              />
              <InfoRow
                label="Previous"
                value={truncHash(block.previous)}
                copyText={block.previous}
              />
              <InfoRow
                label="Merkle Root"
                value={truncHash(block.transaction_merkle_root)}
                copyText={block.transaction_merkle_root}
              />
              <InfoRow
                label="Transactions"
                value={`${block.transactions?.length || 0} transactions`}
                icon={<Hash size={14} className="text-default-400" />}
              />
            </CardBody>
          </Card>

          {/* Transactions */}
          {block.transactions && block.transactions.length > 0 && (
            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Chip size="sm" color="primary" variant="flat">
                    {block.transactions.length}
                  </Chip>
                  <h3 className="font-bold">Transactions</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                {block.transactions.map((tx, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                  >
                    <Card
                      className="bg-default-50/80 dark:bg-default-50/50 border border-default-200/40 dark:border-default-100/30 hover:border-default-300 dark:hover:border-default-200 transition-colors"
                      shadow="none"
                    >
                      <CardBody className="p-3 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "bg-default/20",
                              content: "text-[10px] font-mono font-bold",
                            }}
                          >
                            TX #{idx + 1}
                          </Chip>
                          {block.transaction_ids?.[idx] && (
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/explorer/transaction/${block.transaction_ids[idx]}`}
                                className="text-xs font-mono text-primary hover:underline truncate max-w-[180px]"
                              >
                                {truncHash(block.transaction_ids[idx])}
                              </Link>
                              <CopyButton
                                text={block.transaction_ids[idx]}
                                size={12}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {tx.operations.map(([opType, opData], opIdx) => (
                            <div
                              key={opIdx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Chip
                                size="sm"
                                variant="dot"
                                color={getOpColor(opType)}
                                classNames={{
                                  base: "border-none",
                                  content:
                                    "text-[10px] font-semibold uppercase",
                                }}
                              >
                                {opType}
                              </Chip>
                              <pre className="text-xs text-default-500 dark:text-default-400 overflow-x-auto flex-1 whitespace-pre-wrap break-all max-h-28 overflow-y-auto scrollbar-hide">
                                {JSON.stringify(opData, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </CardBody>
            </Card>
          )}

          {block.transactions?.length === 0 && (
            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardBody className="text-center text-default-400 py-10">
                No transactions in this block.
              </CardBody>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyText,
  icon,
  isLink,
}: {
  label: string;
  value: string;
  copyText?: string;
  icon?: React.ReactNode;
  isLink?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-default-200/30 dark:border-default-100/30 last:border-none">
      <span className="text-xs text-default-500 dark:text-default-400 font-semibold uppercase tracking-wider w-32 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon}
        {isLink ? (
          <Link
            href={`/@${value}`}
            className="text-sm font-mono text-primary hover:underline"
          >
            @{value}
          </Link>
        ) : (
          <span className="text-sm font-mono truncate text-foreground">
            {value}
          </span>
        )}
        {copyText && <CopyButton text={copyText} />}
      </div>
    </div>
  );
}

function getOpColor(
  opType: string,
): "primary" | "success" | "warning" | "danger" | "secondary" | "default" {
  const map: Record<string, any> = {
    vote: "primary",
    comment: "success",
    transfer: "warning",
    custom_json: "secondary",
    claim_reward_balance: "success",
    delegate_vesting_shares: "primary",
    account_witness_vote: "warning",
    transfer_to_vesting: "success",
    withdraw_vesting: "danger",
  };
  return map[opType] || "default";
}
