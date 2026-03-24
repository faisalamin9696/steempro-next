"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  Send,
  Plus,
  Trash2,
  Import,
  Info,
  RotateCcw,
  Activity,
  Zap,
  CreditCard,
  Hash,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useSession } from "next-auth/react";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { handleSteemError } from "@/utils/steemApiError";
import { useAppSelector } from "@/hooks/redux/store";
import { normalizeUsername } from "@/utils/editor";
import { useTranslations } from "next-intl";
import SPopover from "@/components/ui/SPopover";
import { motion, AnimatePresence } from "framer-motion";

type Currency = "STEEM" | "SBD";

interface TransferRow {
  id: string;
  to: string;
  amount: string;
  memo: string;
}

export default function BatchTransferPage() {
  const t = useTranslations("BatchTransfer");
  const { data: session } = useSession();
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const { authenticateOperation } = useAccountsContext();

  const [currency, setCurrency] = useState<Currency>("STEEM");
  const [transfers, setTransfers] = useState<TransferRow[]>([
    { id: Date.now().toString(), to: "", amount: "", memo: "" },
  ]);

  const [isPending, setIsPending] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [lineSeparator, setLineSeparator] = useState("newline");
  const [customLineSeparator, setCustomLineSeparator] = useState("");

  const availableBalance =
    currency === "STEEM" ? loginData.balance_steem : loginData.balance_sbd;

  const totalAmount = useMemo(() => {
    return transfers.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [transfers]);

  const isValid = useMemo(() => {
    if (transfers.length === 0) return false;
    if (totalAmount <= 0) return false;
    if (totalAmount > (availableBalance || 0)) return false;

    for (const t of transfers) {
      if (!t.to.trim() || !t.amount || parseFloat(t.amount) <= 0) {
        return false;
      }
    }
    return true;
  }, [transfers, totalAmount, availableBalance]);

  const handleAddRow = () => {
    setTransfers([
      ...transfers,
      { id: Date.now().toString(), to: "", amount: "", memo: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (transfers.length > 1) {
      setTransfers(transfers.filter((t) => t.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof TransferRow, value: string) => {
    setTransfers(
      transfers.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const handleReset = () => {
    setTransfers([{ id: Date.now().toString(), to: "", amount: "", memo: "" }]);
    setCurrency("STEEM");
    setIsBulkMode(false);
    setBulkInput("");
  };

  const handleParseBulk = () => {
    if (!bulkInput.trim()) return;

    let lSep = "\n";
    if (lineSeparator === "semicolon") lSep = ";";
    else if (lineSeparator === "comma") lSep = ",";
    else if (lineSeparator === "custom") lSep = customLineSeparator;

    if (!lSep) {
      toast.error(t("error.invalidSeparator"));
      return;
    }

    const lines = bulkInput.split(lSep);
    const newTransfers: TransferRow[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.includes(",")
        ? line.split(",").map((p) => p.trim())
        : line.trim().split(/\s+/);

      if (parts.length >= 2) {
        const username = normalizeUsername(parts[0]);
        const amount = parseFloat(parts[1]);

        if (username && !isNaN(amount) && amount > 0) {
          const memo = parts.slice(2).join(" ");
          newTransfers.push({
            id: Math.random().toString(36).substring(7),
            to: username,
            amount: amount.toFixed(3),
            memo: memo || "",
          });
        }
      }
    }

    if (newTransfers.length > 0) {
      setTransfers(newTransfers);
      setIsBulkMode(false);
      setBulkInput("");
      toast.success(t("success.imported", { count: newTransfers.length }));
    } else {
      toast.error(t("error.parseError"));
    }
  };

  const executeBatchTransfer = async () => {
    if (!session?.user?.name) {
      toast.error(t("error.loginFirst"));
      return;
    }

    setIsPending(true);

    try {
      await handleSteemError(async () => {
        const { key, useKeychain } = await authenticateOperation("active");

        const formattedTransfers = transfers.map((t) => ({
          to: normalizeUsername(t.to),
          amount: `${parseFloat(t.amount).toFixed(3)} ${currency}`,
          memo: t.memo,
        }));

        await steemApi.batchTransfer(
          session?.user?.name!,
          formattedTransfers,
          key,
          useKeychain,
        );

        toast.success(t("success.broadcast"), {
          description: t("success.sent", {
            total: totalAmount.toFixed(3),
            currency,
            count: transfers.length,
          }),
        });

        // Reset
        setTransfers([
          { id: Date.now().toString(), to: "", amount: "", memo: "" },
        ]);
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Send}
        color="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/20 via-primary to-primary/20 animate-pulse" />
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-default-50/20 border-b border-default-200 py-4 px-4 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <Select
                  selectedKeys={[currency]}
                  onSelectionChange={(key) =>
                    setCurrency(key.currentKey?.toString() as Currency)
                  }
                  className="w-full sm:w-32"
                  size="sm"
                  variant="bordered"
                  aria-label={t("currency")}
                  isDisabled={isPending}
                  classNames={{
                    trigger: "h-9 border-default-200 bg-content1 shadow-none",
                    value:
                      "font-black text-[10px] tracking-widest text-primary",
                  }}
                >
                  <SelectItem key="STEEM">STEEM</SelectItem>
                  <SelectItem key="SBD">SBD</SelectItem>
                </Select>

                <div className="flex items-center gap-2 px-3 py-1 bg-content1 rounded-full border border-default-200 shadow-inner w-full sm:w-auto justify-center sm:justify-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-muted uppercase tracking-tighter">
                    Balance: {(availableBalance || 0).toLocaleString()}{" "}
                    {currency}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                <SPopover
                  title={t("confirmTitle")}
                  description={t("confirmDesc")}
                  trigger={
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      className="font-bold text-[10px] uppercase tracking-widest h-8"
                      startContent={<RotateCcw size={14} />}
                      isDisabled={isPending}
                    >
                      {t("clearAll")}
                    </Button>
                  }
                >
                  {(onClose) => (
                    <div className="flex gap-2 self-end">
                      <Button size="sm" variant="flat" onPress={onClose}>
                        {t("cancel")}
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => {
                          onClose();
                          handleReset();
                        }}
                      >
                        {t("clearAll")}
                      </Button>
                    </div>
                  )}
                </SPopover>

                <Button
                  size="sm"
                  variant="flat"
                  className="font-bold text-[10px] uppercase tracking-widest h-8"
                  startContent={<Import size={14} />}
                  onPress={() => setIsBulkMode(!isBulkMode)}
                  isDisabled={isPending}
                >
                  {isBulkMode ? "Visual Editor" : t("bulkImport")}
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="font-bold text-[10px] uppercase tracking-widest h-8"
                  startContent={<Plus size={14} />}
                  onPress={handleAddRow}
                  isDisabled={isPending || isBulkMode}
                >
                  {t("addRow")}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {isBulkMode ? (
                <div className="space-y-4 animate-opacity">
                  <div className="flex bg-primary/5 border border-primary/20 text-primary p-4 rounded-lg gap-3">
                    <Info size={20} className="shrink-0" />
                    <p className="opacity-90 leading-relaxed font-medium text-sm">
                      {t("bulkInfo")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2 items-end">
                      <Select
                        aria-label="Select Separator"
                        label={t("lineSeparator")}
                        selectedKeys={[lineSeparator]}
                        onSelectionChange={(key) =>
                          setLineSeparator(
                            key.currentKey?.toString() || "newline",
                          )
                        }
                        className="grow"
                        size="sm"
                        variant="bordered"
                      >
                        <SelectItem key="newline">{t("newLine")}</SelectItem>
                        <SelectItem key="semicolon">
                          {t("semicolon")}
                        </SelectItem>
                        <SelectItem key="comma">{t("comma")}</SelectItem>
                        <SelectItem key="custom">{t("custom")}</SelectItem>
                      </Select>
                      {lineSeparator === "custom" && (
                        <Input
                          aria-label={t("customPlaceholder")}
                          placeholder={t("customPlaceholder")}
                          size="sm"
                          value={customLineSeparator}
                          onValueChange={setCustomLineSeparator}
                          className="w-24 shrink-0"
                          variant="bordered"
                        />
                      )}
                    </div>
                  </div>
                  <Textarea
                    aria-label={t("bulkPlaceholder")}
                    minRows={8}
                    placeholder={t("bulkPlaceholder")}
                    value={bulkInput}
                    onValueChange={setBulkInput}
                    variant="bordered"
                    classNames={{
                      input: "font-mono text-xs uppercase leading-relaxed",
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      color="primary"
                      className="font-bold uppercase tracking-widest text-[10px]"
                      onPress={handleParseBulk}
                    >
                      Parse Payload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {transfers.map((tRow, index) => (
                      <motion.div
                        key={tRow.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative grid grid-cols-12 gap-2 md:gap-4 p-4 rounded-lg bg-content1/40 border border-default-200 shadow-sm items-center overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        <div className="col-span-1 text-center font-black text-[10px] text-muted font-mono">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="col-span-9 md:col-span-3">
                          <Input
                            aria-label={t("username")}
                            placeholder={t("username")}
                            size="sm"
                            value={tRow.to}
                            onValueChange={(val) =>
                              updateRow(tRow.id, "to", val)
                            }
                            isDisabled={isPending}
                            autoCapitalize="off"
                            variant="bordered"
                            classNames={{
                              input: "text-xs font-medium truncate",
                              inputWrapper:
                                "h-9 border-default-200 shadow-none hover:border-primary/50 transition-colors",
                            }}
                            startContent={
                              <span className="text-primary/60 font-black text-[10px]">
                                @
                              </span>
                            }
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center items-center order-3 md:order-last">
                          <Button
                            isIconOnly
                            aria-label="Delete"
                            variant="light"
                            className="text-default-300 hover:text-danger hover:bg-danger/5 transition-all w-8 h-8 min-w-8"
                            size="sm"
                            onPress={() => handleRemoveRow(tRow.id)}
                            isDisabled={transfers.length <= 1 || isPending}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>

                        <div className="col-span-5 md:col-span-3">
                          <Input
                            aria-label="Amount"
                            placeholder="0.000"
                            type="number"
                            step="0.001"
                            size="sm"
                            value={tRow.amount}
                            onValueChange={(val) =>
                              updateRow(tRow.id, "amount", val)
                            }
                            min={0.001}
                            variant="bordered"
                            isDisabled={isPending}
                            classNames={{
                              input: "text-center text-xs font-bold",
                              inputWrapper:
                                "h-9 border-default-200 shadow-none focus-within:border-primary/50 transition-colors",
                            }}
                            endContent={
                              <span className="text-muted font-black text-[9px]">
                                {currency}
                              </span>
                            }
                          />
                        </div>
                        <div className="col-span-7 md:col-span-4 relative flex items-center">
                          <Input
                            aria-label={t("memoOptional")}
                            placeholder={t("memoOptional")}
                            size="sm"
                            value={tRow.memo}
                            onValueChange={(val) =>
                              updateRow(tRow.id, "memo", val)
                            }
                            isDisabled={isPending}
                            autoCapitalize="off"
                            variant="bordered"
                            classNames={{
                              input: "text-xs italic",
                              inputWrapper:
                                "h-9 border-default-200 shadow-none hover:border-primary/50 transition-colors",
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="pt-4 flex justify-center">
                    <Button
                      size="sm"
                      variant="light"
                      className="font-black uppercase tracking-[0.3em] text-[9px] text-muted hover:text-primary transition-all px-6 py-4"
                      startContent={<Plus size={14} />}
                      onPress={handleAddRow}
                      isDisabled={isPending || isBulkMode}
                    >
                      Add New Target
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Right Column - Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4 relative"
        >
          <div className="sticky top-20">
            <Card className="border border-default-200 rounded-lg shadow-2xl shadow-primary/5 bg-content1/40 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/30 via-primary to-primary/30" />
              <CardHeader className="bg-default-50/20 border-b border-default-200 py-3 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                Transfer Summary
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 group-hover:text-primary transition-colors">
                    <Hash size={12} /> Recipients
                  </span>
                  <span className="font-mono text-sm font-bold bg-content1 px-2 py-0.5 rounded border border-default-200 shadow-inner">
                    {
                      transfers.filter(
                        (t) => t.to.trim() !== "" || parseFloat(t.amount) > 0,
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                    <span>Total Amount</span>
                    <span className="text-primary font-mono">
                      {totalAmount.toFixed(3)} {currency}
                    </span>
                  </div>
                  <div className="flex bg-default-50/50 p-3 rounded-lg border border-default-200/50 items-center justify-between">
                    <CreditCard size={14} className="text-muted" />
                    <div className="text-right">
                      <div className="text-[9px] font-black text-muted uppercase tracking-tighter">
                        Available Liquid
                      </div>
                      <div
                        className={`text-sm font-mono font-bold ${totalAmount > (availableBalance || 0) ? "text-danger" : "text-success"}`}
                      >
                        {availableBalance?.toLocaleString() || "0.000"}{" "}
                        {currency}
                      </div>
                    </div>
                  </div>
                </div>

                {totalAmount > (availableBalance || 0) && (
                  <div className="flex bg-danger/5 border border-danger/20 p-3 rounded-lg gap-2 items-center">
                    <Zap size={14} className="text-danger animate-pulse" />
                    <p className="text-[9px] font-black text-danger uppercase tracking-widest">
                      Insufficient Liquid Assets
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      color="primary"
                      className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-primary/20 bg-primary text-white"
                      endContent={!isPending && <Send size={16} />}
                      isDisabled={!isValid || isPending}
                      isLoading={isPending}
                      onPress={executeBatchTransfer}
                    >
                      Authorize Transfer
                    </Button>
                  </motion.div>
                </div>

                <div className="p-4 bg-default-50/50 backdrop-blur-sm rounded-lg border border-default-200 group hover:border-primary/20 transition-colors mt-2">
                  <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-3 flex items-center gap-2">
                    <Activity size={12} className="text-primary" /> Important
                    Notes
                  </h4>
                  <ul className="text-[9px] text-muted space-y-2.5 font-medium leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-primary">01</span>
                      <span>
                        Active Key is required to authorize transfers.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">02</span>
                      <span>
                        Transfers are permanent and cannot be reversed.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">03</span>
                      <span>
                        Your balance is checked in real-time before sending.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
