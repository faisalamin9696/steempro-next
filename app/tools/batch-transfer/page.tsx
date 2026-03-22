"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Send, Plus, Trash2, Import, Info, RotateCcw } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Send}
        color="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-3 space-y-4">
          <Card shadow="sm" className="border border-default-200">
            <CardHeader className="flex flex-row justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
              <div className="flex items-center gap-3">
                <Select
                  selectedKeys={[currency]}
                  onSelectionChange={(key) =>
                    setCurrency(key.currentKey?.toString() as Currency)
                  }
                  className="w-32"
                  size="sm"
                  aria-label={t("currency")}
                  isDisabled={isPending}
                >
                  <SelectItem key="STEEM">STEEM</SelectItem>
                  <SelectItem key="SBD">SBD</SelectItem>
                </Select>
              </div>

              <div className="flex gap-2">
                <SPopover
                  title={t("confirmTitle")}
                  description={t("confirmDesc")}
                  trigger={
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<RotateCcw size={16} />}
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
                  startContent={<Import size={16} />}
                  onPress={() => {
                    if (!isBulkMode) {
                      const lSep =
                        lineSeparator === "semicolon"
                          ? ";"
                          : lineSeparator === "comma"
                            ? ","
                            : lineSeparator === "custom" && customLineSeparator
                              ? customLineSeparator
                              : "\n";

                      const formatted = transfers
                        .filter((t) => t.to || t.amount || t.memo)
                        .map((t) => `${t.to} ${t.amount} ${t.memo}`.trim())
                        .join(lSep);
                      setBulkInput(formatted);
                    }
                    setIsBulkMode(!isBulkMode);
                  }}
                  isDisabled={isPending}
                >
                  {t("bulkImport")}
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Plus size={16} />}
                  onPress={handleAddRow}
                  isDisabled={isPending || isBulkMode}
                >
                  {t("addRow")}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-4 bg-content1">
              {isBulkMode ? (
                <div className="space-y-4 animate-opacity">
                  <div className="flex bg-primary/10 text-primary p-3 rounded-lg gap-3 text-sm">
                    <Info size={20} className="shrink-0" />
                    <p>{t("bulkInfo")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2 items-end">
                      <Select
                        label={t("lineSeparator")}
                        selectedKeys={[lineSeparator]}
                        onSelectionChange={(key) =>
                          setLineSeparator(
                            key.currentKey?.toString() || "newline",
                          )
                        }
                        className="grow"
                        size="sm"
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
                          placeholder={t("customPlaceholder")}
                          size="sm"
                          value={customLineSeparator}
                          onValueChange={setCustomLineSeparator}
                          className="w-24 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                  <Textarea
                    minRows={8}
                    placeholder={t("bulkPlaceholder")}
                    value={bulkInput}
                    onValueChange={setBulkInput}
                    classNames={{ input: "font-mono text-sm" }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="flat" onPress={() => setIsBulkMode(false)}>
                      {t("cancel")}
                    </Button>
                    <Button color="primary" onPress={handleParseBulk}>
                      {t("parseList")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">
                    <div className="col-span-3">{t("recipient")}</div>
                    <div className="col-span-3">{t("amount")}</div>
                    <div className="col-span-5">{t("memo")}</div>
                    <div className="col-span-1 text-center">{t("action")}</div>
                  </div>

                  {transfers.map((tRow, index) => (
                    <div
                      key={tRow.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-default-50 p-3 md:p-1 md:bg-transparent rounded-lg border border-default-100 md:border-none"
                    >
                      <div className="col-span-3">
                        <Input
                          placeholder={t("username")}
                          size="sm"
                          value={tRow.to}
                          onValueChange={(val) => updateRow(tRow.id, "to", val)}
                          isDisabled={isPending}
                          autoCapitalize="off"
                          startContent={
                            <span className="text-default-400 text-small">
                              @
                            </span>
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="0.000"
                          type="number"
                          step="0.001"
                          size="sm"
                          value={tRow.amount}
                          onValueChange={(val) =>
                            updateRow(tRow.id, "amount", val)
                          }
                          isDisabled={isPending}
                          endContent={
                            <span className="text-default-400 text-xs">
                              {currency}
                            </span>
                          }
                        />
                      </div>
                      <div className="col-span-5 relative flex items-center">
                        <Input
                          placeholder={t("memoOptional")}
                          size="sm"
                          value={tRow.memo}
                          onValueChange={(val) =>
                            updateRow(tRow.id, "memo", val)
                          }
                          isDisabled={isPending}
                          autoCapitalize="off"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end md:justify-center items-center h-full pt-1 md:pt-0">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => handleRemoveRow(tRow.id)}
                          isDisabled={transfers.length <= 1 || isPending}
                          aria-label="Remove Row"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {transfers.length > 5 && (
                    <div className="pt-2 flex justify-center">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Plus size={16} />}
                        onPress={handleAddRow}
                        isDisabled={isPending}
                      >
                        {t("addAnotherRow")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1 space-y-4 relative">
          <div className="sticky top-20">
            <Card shadow="sm" className="border border-default-200">
              <CardHeader className="bg-default-50 border-b border-default-200 py-3 px-4 font-semibold text-foreground">
                {t("summary")}
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">{t("recipients")}</span>
                  <span className="font-semibold">
                    {
                      transfers.filter(
                        (t) => t.to.trim() !== "" || parseFloat(t.amount) > 0,
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">{t("totalAmount")}</span>
                  <span className="font-bold text-primary">
                    {totalAmount.toFixed(3)} {currency}
                  </span>
                </div>

                <div className="my-2 border-t border-default-200 border-dashed" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">{t("yourBalance")}</span>
                  <span
                    className={`font-semibold ${totalAmount > (availableBalance || 0) ? "text-danger" : "text-success"}`}
                  >
                    {availableBalance?.toLocaleString() || "0.000"} {currency}
                  </span>
                </div>

                {totalAmount > (availableBalance || 0) && (
                  <p className="text-xs text-danger text-center bg-danger/10 p-2 rounded">
                    {t("insufficientBalance")}
                  </p>
                )}

                <Button
                  color="primary"
                  className="w-full mt-4 font-semibold shadow-md shadow-primary/20"
                  endContent={!isPending && <Send size={18} />}
                  isDisabled={!isValid || isPending}
                  isLoading={isPending}
                  onPress={executeBatchTransfer}
                >
                  {t("sendButton")}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
