"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  CheckSquare,
  Plus,
  Trash2,
  Import,
  Info,
  RotateCcw,
  Activity,
  Zap,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { useSession } from "next-auth/react";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/redux/store";
import { Chip } from "@heroui/chip";
import { Slider } from "@heroui/react";
import { useTranslations } from "next-intl";
import SPopover from "@/components/ui/SPopover";
import { motion, AnimatePresence } from "framer-motion";

interface VoteRow {
  id: string;
  url: string;
  weight: number | null; // null means use global weight
  status: "pending" | "voting" | "success" | "error";
  errorMsg?: string;
}

export function parseSteemUrl(
  url: string,
): { author: string; permlink: string } | null {
  try {
    const match = url.match(/@([a-zA-Z0-9.-]+)\/([a-zA-Z0-9-]+)/);
    if (match) {
      return { author: match[1], permlink: match[2] };
    }
  } catch (e) {}
  return null;
}

export default function BatchVotingPage() {
  const t = useTranslations("BatchVoting");
  const { data: session } = useSession();
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const { authenticateOperation } = useAccountsContext();

  const [votes, setVotes] = useState<VoteRow[]>([
    { id: Date.now().toString(), url: "", weight: null, status: "pending" },
  ]);
  const [globalWeight, setGlobalWeight] = useState<number>(100);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [lineSeparator, setLineSeparator] = useState("newline");
  const [customLineSeparator, setCustomLineSeparator] = useState("");

  const [isVoting, setIsVoting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState("");

  // Abort controller simulation for pausing/stopping
  const votingStateRef = useRef({ isVoting: false, isPaused: false });

  useEffect(() => {
    votingStateRef.current = { isVoting, isPaused };
  }, [isVoting, isPaused]);

  // Derived state
  const validVotes = useMemo(() => {
    return votes.filter((v) => parseSteemUrl(v.url) !== null);
  }, [votes]);

  const completedCount = votes.filter((v) => v.status === "success").length;
  const errorCount = votes.filter((v) => v.status === "error").length;

  const isValid =
    validVotes.length > 0 &&
    validVotes.length === votes.filter((v) => v.url.trim() !== "").length &&
    votes.some((v) => v.url.trim());

  const estimatedTime = useMemo(() => {
    const pendingCount = votes.filter(
      (v) => ["pending", "error"].includes(v.status) && v.url.trim(),
    ).length;
    return pendingCount * 3.5; // ~3 seconds delay per post
  }, [votes]);

  const handleAddRow = () => {
    setVotes([
      ...votes,
      { id: Date.now().toString(), url: "", weight: null, status: "pending" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (votes.length > 1) {
      setVotes(votes.filter((v) => v.id !== id));
    }
  };

  const handleReset = () => {
    setVotes([
      { id: Date.now().toString(), url: "", weight: null, status: "pending" },
    ]);
    setGlobalWeight(100);
    setIsBulkMode(false);
    setBulkInput("");
  };

  const updateRowById = (
    id: string,
    updates: Partial<Pick<VoteRow, "status" | "errorMsg">>,
  ) => {
    setVotes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    );
  };

  // User-facing edit: resets status back to pending.
  const updateRow = (id: string, field: "url" | "weight", value: any) => {
    setVotes((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, [field]: value, status: "pending", errorMsg: undefined }
          : v,
      ),
    );
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
    const newVotes: VoteRow[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.includes(",")
        ? line.split(",").map((p) => p.trim())
        : line.trim().split(/\s+/);

      if (parts.length >= 1) {
        const urlStr = parts[0];
        const parsed = parseSteemUrl(urlStr);
        if (parsed) {
          let weight: number | null = null;
          if (parts.length >= 2) {
            const parsedWeight = parseFloat(parts[1]);
            if (
              !isNaN(parsedWeight) &&
              parsedWeight >= -100 &&
              parsedWeight <= 100
            ) {
              weight = parsedWeight;
            }
          }

          newVotes.push({
            id: Math.random().toString(36).substring(7),
            url: urlStr,
            weight: weight,
            status: "pending",
          });
        }
      }
    }

    if (newVotes.length > 0) {
      setVotes(newVotes);
      setIsBulkMode(false);
      setBulkInput("");
      toast.success(t("success.imported", { count: newVotes.length }));
    } else {
      toast.error(t("error.parseError"));
    }
  };

  const executeVotes = async () => {
    if (!session?.user?.name) {
      toast.error(t("error.loginFirst"));
      return;
    }

    setIsVoting(true);
    setIsPaused(false);
    setCurrentAction(t("progress.preparing"));

    // Reset any previous errors
    setVotes((prev) =>
      prev.map((v) =>
        v.status === "error"
          ? { ...v, status: "pending", errorMsg: undefined }
          : v,
      ),
    );

    let localVotes = [...votes];
    const { key, useKeychain } = await authenticateOperation("active");

    for (let i = 0; i < localVotes.length; i++) {
      // Check if stopped/paused
      if (!votingStateRef.current.isVoting) break;
      while (votingStateRef.current.isPaused) {
        if (!votingStateRef.current.isVoting) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!votingStateRef.current.isVoting) break;

      const voteObj = localVotes[i];
      if (voteObj.status === "success") continue;
      if (!voteObj.url.trim()) continue;

      const parsedResult = parseSteemUrl(voteObj.url);
      if (!parsedResult) {
        updateRowById(voteObj.id, {
          status: "error",
          errorMsg: t("error.invalidUrl"),
        });
        continue;
      }

      setCurrentIndex(i + 1);
      setCurrentAction(t("progress.votingOn", { author: parsedResult.author }));
      updateRowById(voteObj.id, { status: "voting" });

      const actualWeight =
        voteObj.weight !== null ? voteObj.weight : globalWeight;
      const scaledWeight = Math.floor(actualWeight * 100); // 100% = 10000

      let success = false;
      let errorMsg = "Failed to vote";

      try {
        await steemApi.vote(
          session.user.name,
          parsedResult.author,
          parsedResult.permlink,
          scaledWeight,
          key,
          useKeychain,
        );
        success = true;
      } catch (err: any) {
        errorMsg = err?.message || err || "Unknown Steem API Error";
      }

      if (success) {
        updateRowById(voteObj.id, { status: "success" });
        toast.success(t("success.voted", { author: parsedResult.author }), {
          position: "bottom-left",
        });
      } else {
        updateRowById(voteObj.id, { status: "error", errorMsg: errorMsg });
        toast.error(
          t("error.errorVoted", {
            author: parsedResult.author,
            error: errorMsg,
          }),
          {
            position: "bottom-left",
          },
        );
      }

      // Ensure 3-second delay, but also respect early abort
      if (i < localVotes.length - 1 && votingStateRef.current.isVoting) {
        setCurrentAction(t("progress.waiting"));
        let waitTime = 3500;
        const interval = 100;
        while (waitTime > 0) {
          if (!votingStateRef.current.isVoting) break;
          await new Promise((r) => setTimeout(r, interval));
          waitTime -= interval;
        }
      }
    }

    if (votingStateRef.current.isVoting) {
      toast.success(t("success.completed"));
    } else {
      toast.error(t("error.votingStopped"));
    }

    setIsVoting(false);
    setIsPaused(false);
    setCurrentAction("");
    setCurrentIndex(0);
  };

  const cancelVoting = () => {
    setIsVoting(false);
    setIsPaused(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={CheckSquare}
        color="success"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Global Controls */}
          <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-success/20 via-success to-success/20 animate-pulse" />
            <CardBody className="p-6 bg-default-50/10 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={12} className="text-success" />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                    Global Vote Weight
                  </span>
                </div>
                <div className="flex gap-6 items-center">
                  <Slider
                    aria-label="Vote Weight"
                    size="sm"
                    step={1}
                    color="success"
                    value={globalWeight}
                    onChange={(val) => setGlobalWeight(val as number)}
                    minValue={-100}
                    maxValue={100}
                    isDisabled={isVoting}
                    className="grow"
                  />
                  <div className="flex bg-content1 px-3 py-1.5 rounded-lg border border-default-200 shadow-inner group min-w-[60px] justify-center">
                    <span className="font-mono text-sm font-bold text-success/80 group-hover:text-success transition-colors">
                      {globalWeight > 0 ? "+" : ""}
                      {globalWeight}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-default-200/50 self-center" />
              <div className="flex flex-col gap-1">
                <span className="font-black text-[9px] uppercase tracking-widest text-muted">
                  Voting strength presets
                </span>
                <div className="flex gap-2">
                  {[-100, 0, 100].map((val) => (
                    <Button
                      key={val}
                      size="sm"
                      variant="flat"
                      className="h-7 min-w-10 text-[9px] font-bold"
                      onPress={() => setGlobalWeight(val)}
                      isDisabled={isVoting}
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card
            shadow="sm"
            className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md"
          >
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-default-50/20 border-b border-default-200 py-3 px-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-success rounded-full animate-bounce" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                  Voting list
                </span>
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
                      isDisabled={isVoting}
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
                  isDisabled={isVoting}
                >
                  {isBulkMode ? "View List" : t("bulkImport")}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {isBulkMode ? (
                <div className="space-y-4 animate-opacity">
                  <div className="flex bg-success/5 border border-success/20 text-success p-4 rounded-lg gap-3 text-sm">
                    <Info size={20} className="shrink-0" />
                    <p className="opacity-90 leading-relaxed font-medium">
                      {t("bulkInfo", {
                        url: "url",
                        url_weight: "url custom_weight",
                      })}
                    </p>
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
                    minRows={8}
                    placeholder={`https://www.steempro.com/@author/permlink\nhttps://www.steempro.com/@author/permlink2 75`}
                    value={bulkInput}
                    onValueChange={setBulkInput}
                    variant="bordered"
                    classNames={{
                      input: "font-mono text-xs uppercase leading-relaxed",
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      color="success"
                      className="font-bold uppercase tracking-widest text-[10px]"
                      onPress={handleParseBulk}
                    >
                      Import List
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {votes.map((v, index) => (
                      <motion.div
                        key={v.id}
                        layout
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        exit={{ x: -20 }}
                        className={`relative grid grid-cols-12 gap-1 md:gap-4 p-4 rounded-lg border transition-all items-center overflow-hidden
                        ${v.status === "voting" ? "bg-success/5 border-success/30 shadow-[0_0_15px_rgba(var(--heroui-success),0.1)]" : "bg-content1/40 border-default-200 shadow-sm"}
                        ${v.status === "success" ? "bg-default-50/20 border-default-200/50 opacity-80" : ""}
                        ${v.status === "error" ? "bg-danger/5 border-danger/20" : ""}
                      `}
                      >
                        {v.status === "voting" && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-success shadow-[0_0_8px_rgba(var(--heroui-success),0.8)]"
                            layoutId="active-indicator"
                          />
                        )}

                        <div className="col-span-1 text-center font-black text-[10px] text-muted font-mono">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="col-span-9 md:col-span-6">
                          <Input
                            placeholder={t("urlPlaceholder")}
                            size="sm"
                            value={v.url}
                            onValueChange={(val) => updateRow(v.id, "url", val)}
                            isDisabled={isVoting || v.status === "success"}
                            variant="bordered"
                            color={
                              v.status === "error"
                                ? "danger"
                                : v.status === "success"
                                  ? "success"
                                  : "default"
                            }
                            classNames={{
                              input: "text-xs font-medium truncate",
                              inputWrapper:
                                "h-9 border-default-200 shadow-none hover:border-success/50 transition-colors",
                            }}
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center items-center order-3 md:order-last">
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-default-300 hover:text-danger hover:bg-danger/5 transition-all w-8 h-8 min-w-8"
                            size="sm"
                            onPress={() => handleRemoveRow(v.id)}
                            isDisabled={votes.length <= 1 || isVoting}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>

                        <div className="col-span-5 md:col-span-2">
                          <Input
                            placeholder={t("global")}
                            type="number"
                            size="sm"
                            value={v.weight === null ? "" : v.weight.toString()}
                            onValueChange={(val) =>
                              updateRow(
                                v.id,
                                "weight",
                                val ? Number(val) : null,
                              )
                            }
                            isDisabled={isVoting || v.status === "success"}
                            variant="bordered"
                            classNames={{
                              input: "text-center text-xs font-bold",
                              inputWrapper:
                                "h-9 border-default-200 shadow-none focus-within:border-success/50 transition-colors",
                            }}
                            endContent={
                              <span className="text-[9px] font-black text-default-300">
                                %
                              </span>
                            }
                          />
                        </div>

                        <div className="col-span-7 md:col-span-2 flex justify-center">
                          <AnimatePresence mode="wait">
                            {v.status === "pending" && (
                              <motion.div
                                key="pending"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Chip
                                  size="sm"
                                  variant="dot"
                                  color="default"
                                  className="border-none font-black text-[9px] uppercase tracking-[0.2em]"
                                >
                                  STANDBY
                                </Chip>
                              </motion.div>
                            )}
                            {v.status === "voting" && (
                              <motion.div
                                key="voting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  className="animate-pulse font-black text-[9px] uppercase tracking-[0.2em] h-5"
                                >
                                  VOTING
                                </Chip>
                              </motion.div>
                            )}
                            {v.status === "success" && (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="success"
                                  className="font-black text-[9px] uppercase tracking-[0.2em] h-5"
                                >
                                  SUCCESS
                                </Chip>
                              </motion.div>
                            )}
                            {v.status === "error" && (
                              <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <SPopover
                                  trigger={
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="danger"
                                      className="cursor-help font-black text-[9px] uppercase tracking-[0.2em] h-5"
                                    >
                                      FAILED
                                    </Chip>
                                  }
                                  title="DIAGNOSTIC_REPORT"
                                >
                                  <p className="text-[10px] font-mono leading-relaxed">
                                    {v.errorMsg || "UNKNOWN_ERROR"}
                                  </p>
                                </SPopover>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="pt-4 flex justify-center">
                    <Button
                      size="sm"
                      variant="light"
                      className="font-black uppercase tracking-[0.3em] text-[9px] text-muted hover:text-success transition-all px-6 py-4"
                      startContent={<Plus size={14} />}
                      onPress={handleAddRow}
                      isDisabled={isVoting || isBulkMode}
                    >
                      Add New Post
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
            <Card className="border border-default-200 rounded-lg shadow-2xl shadow-success/5 bg-content1/40 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-success/30 via-success to-success/30" />
              <CardHeader className="bg-default-50/20 border-b border-default-200 py-3 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                Voting Summary
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 group-hover:text-success transition-colors">
                    <Activity size={12} /> Number of Posts
                  </span>
                  <span className="font-mono text-sm font-bold bg-content1 px-2 py-0.5 rounded border border-default-200 shadow-inner">
                    {validVotes.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                    <span>Estimated Time</span>
                    <span className="text-success font-mono">
                      {estimatedTime > 60
                        ? `${(estimatedTime / 60).toFixed(1)}m`
                        : `${estimatedTime.toFixed(0)}s`}
                    </span>
                  </div>
                  <div className="flex bg-default-50/50 p-2 rounded border border-default-200/50 items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-success animate-ping" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                      {t("progress.safeMode")}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                    <span>Voting Progress</span>
                    <span className="text-success">
                      {validVotes.length > 0
                        ? Math.round(
                            ((completedCount + errorCount) /
                              validVotes.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    color="success"
                    size="sm"
                    value={
                      validVotes.length > 0
                        ? ((completedCount + errorCount) / validVotes.length) *
                          100
                        : 0
                    }
                    className="h-1.5"
                    classNames={{
                      indicator:
                        "bg-success shadow-[0_0_10px_rgba(var(--heroui-success),0.6)]",
                    }}
                    isIndeterminate={
                      isVoting && completedCount + errorCount === 0
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-default-50/50 p-3 rounded-lg border border-default-200/50 text-center backdrop-blur-sm">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                      Success
                    </div>
                    <div className="text-sm font-bold text-success">
                      {completedCount}
                    </div>
                  </div>
                  <div className="bg-default-50/50 p-3 rounded-lg border border-default-200/50 text-center backdrop-blur-sm">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                      Failed
                    </div>
                    <div className="text-sm font-bold text-danger">
                      {errorCount}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {!isVoting ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        color="success"
                        className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-success/20 bg-success text-white"
                        endContent={<CheckSquare size={16} />}
                        isDisabled={!isValid || validVotes.length === 0}
                        onPress={executeVotes}
                      >
                        {t("controls.start")}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        color="warning"
                        variant="flat"
                        className="font-black text-[9px] uppercase tracking-widest h-10"
                        onPress={() => setIsPaused(!isPaused)}
                      >
                        {isPaused ? "RESUME" : "PAUSE"}
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        className="font-black text-[9px] uppercase tracking-widest h-10"
                        onPress={cancelVoting}
                      >
                        ABORT
                      </Button>
                    </div>
                  )}
                </div>

                {currentAction && (
                  <p className="text-[9px] text-center text-muted font-mono animate-pulse uppercase tracking-[0.2em] mt-2">
                    {currentAction}
                  </p>
                )}
              </CardBody>
            </Card>

            <div className="mt-4 p-4 bg-default-50/50 backdrop-blur-sm rounded-lg border border-default-200 group hover:border-success/20 transition-colors">
              <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-3 flex items-center gap-2">
                <Zap size={12} className="text-success" /> Important Notes
              </h4>
              <ul className="text-[9px] text-muted space-y-2.5 font-medium leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-success">01</span>
                  <span>Votes are processed one by one in a secure queue.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-success">02</span>
                  <span>
                    Short delays added between votes to prevent errors.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-success">03</span>
                  <span>
                    Custom weights can be set for each individual post.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
