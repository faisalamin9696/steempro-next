"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  CheckSquare,
  Plus,
  Trash2,
  Import,
  Info,
  Settings,
  AlertCircle,
  RotateCcw,
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
import { handleSteemError } from "@/utils/steemApiError";
import { useAppSelector } from "@/hooks/redux/store";
import { Chip } from "@heroui/chip";
import { auth } from "@/auth";
import { Slider } from "@heroui/react";
import { useTranslations } from "next-intl";
import SPopover from "@/components/ui/SPopover";

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
    setVotes([{ id: Date.now().toString(), url: "", weight: null, status: "pending" }]);
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
        toast.error(t("error.errorVoted", { author: parsedResult.author, error: errorMsg }), {
          position: "bottom-left",
        });
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
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={CheckSquare}
        color="success"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Global Controls */}
          <Card shadow="sm" className="border border-default-200">
            <CardBody className="p-4 bg-default-50 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="w-full sm:w-1/2">
                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Settings size={16} /> {t("globalWeight")}
                </p>
                <div className="flex gap-4 items-center">
                  <Slider
                    size="sm"
                    step={1}
                    color="success"
                    value={globalWeight}
                    onChange={(val) => setGlobalWeight(val as number)}
                    minValue={-100}
                    maxValue={100}
                    isDisabled={isVoting}
                    className="max-w-md"
                  />
                  <Input
                    size="sm"
                    type="number"
                    value={globalWeight.toString()}
                    onValueChange={(v) => setGlobalWeight(Number(v))}
                    className="w-20 shrink-0"
                    min={-100}
                    max={100}
                    isDisabled={isVoting}
                    endContent={
                      <span className="text-default-400 text-xs">%</span>
                    }
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border border-default-200">
            <CardHeader className="flex flex-row justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
              <span className="font-semibold text-foreground">
                {t("postList")}
              </span>

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

                      const formatted = votes
                        .filter((v) => v.url)
                        .map((v) =>
                          `${v.url} ${v.weight !== null ? v.weight : ""}`.trim(),
                        )
                        .join(lSep);
                      setBulkInput(formatted);
                    }
                    setIsBulkMode(!isBulkMode);
                  }}
                  isDisabled={isVoting}
                >
                  {t("bulkImport")}
                </Button>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<Plus size={16} />}
                  onPress={handleAddRow}
                  isDisabled={isVoting || isBulkMode}
                >
                  {t("addPost")}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-4 bg-content1 overflow-x-auto">
              {isBulkMode ? (
                <div className="space-y-4 animate-opacity">
                  <div className="flex bg-success/10 text-success p-3 rounded-lg gap-3 text-sm">
                    <Info size={20} className="shrink-0" />
                    <p>{t("bulkInfo", { url: "url", url_weight: "url custom_weight" })}</p>
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
                    placeholder={`https://www.steempro.com/@author/permlink\nhttps://www.steempro.com/@author/permlink2 75`}
                    value={bulkInput}
                    onValueChange={setBulkInput}
                    classNames={{ input: "font-mono text-sm" }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="flat" onPress={() => setIsBulkMode(false)}>
                      {t("cancel")}
                    </Button>
                    <Button color="success" onPress={handleParseBulk}>
                      {t("parseList")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 min-w-[600px]">
                  <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-6">{t("table.url")}</div>
                    <div className="col-span-2 text-center">{t("table.weight")}</div>
                    <div className="col-span-2 text-center">{t("table.status")}</div>
                    <div className="col-span-1 text-center">{t("table.action")}</div>
                  </div>

                  {votes.map((v, index) => (
                    <div
                      key={v.id}
                      className={`grid grid-cols-12 gap-2 p-1 rounded-lg border border-transparent items-center transition-colors
                        ${v.status === "voting" ? "bg-success/10 border-success/30" : ""}
                        ${v.status === "success" ? "bg-default-50 border-default-200/50" : ""}
                        ${v.status === "error" ? "bg-danger/10 border-danger/30" : ""}
                      `}
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-default-400">
                        {index + 1}
                      </div>
                      <div className="col-span-6">
                        <Input
                          placeholder={t("urlPlaceholder")}
                          size="sm"
                          value={v.url}
                          onValueChange={(val) => updateRow(v.id, "url", val)}
                          isDisabled={isVoting || v.status === "success"}
                          variant={v.status === "error" ? "bordered" : "flat"}
                          color={v.status === "error" ? "danger" : "default"}
                          isInvalid={
                            v.url.trim() !== "" && parseSteemUrl(v.url) === null
                          }
                          errorMessage={
                            v.url.trim() !== "" && parseSteemUrl(v.url) === null
                              ? t("error.invalidUrl")
                              : ""
                          }
                          classNames={{
                            errorMessage: "text-[10px] leading-[10px] absolute",
                          }}
                        />
                      </div>
                      <div className="col-span-2 relative flex items-center justify-center">
                        <Input
                          placeholder={t("global")}
                          type="number"
                          size="sm"
                          value={v.weight === null ? "" : v.weight.toString()}
                          onValueChange={(val) =>
                            updateRow(v.id, "weight", val ? Number(val) : null)
                          }
                          isDisabled={isVoting || v.status === "success"}
                          min={-100}
                          max={100}
                          endContent={
                            <span className="text-default-400 text-[10px]">
                              %
                            </span>
                          }
                        />
                      </div>
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        {v.status === "pending" && (
                          <Chip size="sm" variant="flat" color="default">
                            {t("status.pending")}
                          </Chip>
                        )}
                        {v.status === "voting" && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="animate-pulse"
                          >
                            {t("status.voting")}
                          </Chip>
                        )}
                        {v.status === "success" && (
                          <Chip size="sm" variant="flat" color="success">
                            {t("status.success")}
                          </Chip>
                        )}
                        {v.status === "error" && (
                          <div className="group relative flex justify-center">
                            <Chip size="sm" variant="flat" color="danger">
                              {t("status.failed")}
                            </Chip>
                            {v.errorMsg && (
                              <div className="absolute top-full mt-1 w-max hidden group-hover:block bg-background border border-danger/30 p-1 px-2 rounded text-[10px] text-danger z-10 shadow-lg">
                                {v.errorMsg}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-center items-center h-full">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => handleRemoveRow(v.id)}
                          isDisabled={votes.length <= 1 || isVoting}
                          aria-label="Remove Row"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {votes.length > 5 && (
                    <div className="pt-2 flex justify-center">
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Plus size={16} />}
                        onPress={handleAddRow}
                        isDisabled={isVoting}
                      >
                        {t("addAnotherPost")}
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
                {t("progress.title")}
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">
                    {t("progress.totalPosts")}
                  </span>
                  <span className="font-semibold">{validVotes.length}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">{t("progress.estTime")}</span>
                  <span className="font-mono">
                    {estimatedTime > 60
                      ? `${(estimatedTime / 60).toFixed(1)} ${t("progress.min")}`
                      : `${estimatedTime.toFixed(0)} ${t("progress.sec")}`}
                  </span>
                </div>

                <div className="my-2 border-t border-default-200 border-dashed" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">{t("status.status")}</span>
                  <span className="font-semibold text-success">
                    {completedCount}{" "}
                    <span className="text-default-400 font-normal text-xs">
                      {t("progress.done")}
                    </span>{" "}
                    / {errorCount}{" "}
                    <span className="text-danger font-normal text-xs">
                      {t("progress.err")}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("progress.title")}</span>
                    <span>
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
                    value={
                      validVotes.length > 0
                        ? ((completedCount + errorCount) / validVotes.length) *
                          100
                        : 0
                    }
                    color="success"
                    className="h-2"
                    isIndeterminate={
                      isVoting &&
                      ((completedCount + errorCount) / validVotes.length) *
                        100 ===
                        0
                    }
                  />
                  {currentAction && (
                    <p className="text-[10px] text-default-400 mt-1 truncate animate-pulse text-center">
                      {currentAction}
                    </p>
                  )}
                </div>

                {!isVoting ? (
                  <Button
                    color="success"
                    className="w-full mt-4 font-semibold shadow-md shadow-success/20 text-white"
                    size="lg"
                    endContent={<CheckSquare size={18} />}
                    isDisabled={!isValid || validVotes.length === 0}
                    onPress={executeVotes}
                  >
                    {t("controls.start")}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      color="warning"
                      variant="flat"
                      className="font-semibold"
                      onPress={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? t("controls.resume") : t("controls.pause")}
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      className="font-semibold"
                      onPress={cancelVoting}
                    >
                      {t("controls.stop")}
                    </Button>
                  </div>
                )}

                {votes.length > 0 &&
                  votes.some(
                    (v) => v.url.trim() !== "" && parseSteemUrl(v.url) === null,
                  ) && (
                    <div className="flex items-start gap-2 bg-danger/10 text-danger text-xs p-2 rounded-lg mt-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <p>{t("error.invalidFormat")}</p>
                    </div>
                  )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
