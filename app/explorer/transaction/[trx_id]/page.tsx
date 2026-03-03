"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { ArrowLeft, ArrowRightLeft, Hash } from "lucide-react";
import { condenserApi, SteemTransaction } from "@/libs/consenser";
import { motion } from "framer-motion";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import PageHeader from "@/components/ui/PageHeader";

export default function TransactionDetailPage() {
  const params = useParams();
  const trxId = params.trx_id as string;

  const [transaction, setTransaction] = useState<SteemTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransaction = useCallback(async () => {
    if (!trxId) return;
    setLoading(true);
    setError("");
    setTransaction(null);

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 3000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const tx = await condenserApi.getTransaction(trxId);
        if (!tx) throw new Error("Transaction not found");
        setTransaction(tx);
        setLoading(false);
        return;
      } catch {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
        }
      }
    }

    setError(
      "Transaction not found. It may not be indexed yet, try refreshing in a few seconds.",
    );
    setLoading(false);
  }, [trxId]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const truncHash = (hash: string) =>
    hash ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : "";

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
          title="Transaction"
          description={truncHash(trxId || "")}
          icon={ArrowRightLeft}
          color="primary"
        />
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

      {/* Transaction Details */}
      {transaction && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* TX Info */}
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <ArrowRightLeft size={18} />
                </div>
                <h3 className="font-bold text-lg">Transaction Details</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <TxRow
                label="Transaction ID"
                value={truncHash(transaction.transaction_id)}
                copyText={transaction.transaction_id}
              />
              <TxRow
                label="Block"
                value={`#${transaction.block_num?.toLocaleString()}`}
                linkHref={`/explorer/block/${transaction.block_num}`}
              />
              <TxRow
                label="Position"
                value={`Transaction #${transaction.transaction_num}`}
              />
              <TxRow
                label="Expiration"
                value={new Date(transaction.expiration + "Z").toLocaleString()}
              />
              <TxRow
                label="Ref Block Num"
                value={transaction.ref_block_num?.toString()}
              />
              <TxRow
                label="Ref Block Prefix"
                value={transaction.ref_block_prefix?.toString()}
              />
            </CardBody>
          </Card>

          {/* Operations */}
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="primary" variant="flat">
                  {transaction.operations?.length || 0}
                </Chip>
                <h3 className="font-bold">Operations</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {transaction.operations?.map(([opType, opData], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                >
                  <Card
                    className="bg-default-50/80 dark:bg-default-50/50 border border-default-200/40 dark:border-default-100/30"
                    shadow="none"
                  >
                    <CardBody className="p-3 space-y-2">
                      <Chip
                        size="sm"
                        variant="dot"
                        color={getOpColor(opType)}
                        classNames={{
                          content: "text-[10px] font-bold uppercase",
                        }}
                      >
                        {opType}
                      </Chip>
                      <pre className="text-xs text-default-500 dark:text-default-400 overflow-x-auto whitespace-pre-wrap break-all bg-default-100/50 dark:bg-default-50/50 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-hide">
                        {JSON.stringify(opData, null, 2)}
                      </pre>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Signatures */}
          {transaction.signatures && transaction.signatures.length > 0 && (
            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-default-400" />
                  <h3 className="font-bold">Signatures</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                {transaction.signatures.map((sig, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <pre className="text-xs font-mono text-default-500 dark:text-default-400 truncate flex-1">
                      {sig}
                    </pre>
                    <CopyButton text={sig} />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

function TxRow({
  label,
  value,
  copyText,
  linkHref,
}: {
  label: string;
  value: string;
  copyText?: string;
  linkHref?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-default-200/30 dark:border-default-100/30 last:border-none">
      <span className="text-xs text-default-500 dark:text-default-400 font-semibold uppercase tracking-wider w-36 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {linkHref ? (
          <Link
            href={linkHref}
            className="text-sm font-mono text-primary hover:underline"
          >
            {value}
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
