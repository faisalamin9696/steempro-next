"use client";

import { useState, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  MessageSquare,
  Import,
  Info,
  RotateCcw,
  Play,
  Terminal,
  Hash,
  Activity,
  Zap,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useSession } from "next-auth/react";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { generateReplyPermlink, makeJsonMetadataReply, normalizeUsername } from "@/utils/editor";
import { useTranslations } from "next-intl";
import SPopover from "@/components/ui/SPopover";
import { Progress } from "@heroui/progress";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { sdsApi } from "@/libs/sds";
import { AsyncUtils } from "@/utils/async.utils";

interface CommentTask {
  username: string;
  status:
    | "pending"
    | "fetching"
    | "ready"
    | "broadcasting"
    | "success"
    | "error";
  error?: string;
  postAuthor?: string;
  postPermlink?: string;
  body?: string;
}

export default function BatchCommentingPage() {
  const t = useTranslations("BatchCommenting");
  const { data: session } = useSession();
  const { authenticateOperation } = useAccountsContext();

  const [usernames, setUsernames] = useState<string[]>([]);
  const [template, setTemplate] = useState(
    "Hi @{{username}}, great post! - @{{me}}",
  );
  const [isPending, setIsPending] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [lineSeparator, setLineSeparator] = useState("newline");
  const [customLineSeparator, setCustomLineSeparator] = useState("");
  const [tasks, setTasks] = useState<Record<string, CommentTask>>({});
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const [progress, setProgress] = useState(0);

  const handleReset = () => {
    setUsernames([]);
    setTasks({});
    setIsBulkMode(true);
    setBulkInput("");
    setProgress(0);
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
    const validUsernames: string[] = [];

    for (const line of lines) {
      const u = normalizeUsername(line.trim());
      if (u && !validUsernames.includes(u)) {
        validUsernames.push(u);
      }
    }

    if (validUsernames.length > 0) {
      setUsernames(validUsernames);
      setIsBulkMode(false);

      const initialTasks: Record<string, CommentTask> = {};
      validUsernames.forEach((u) => {
        initialTasks[u] = { username: u, status: "pending" };
      });
      setTasks(initialTasks);

      toast.success(t("success.imported", { count: validUsernames.length }));
    } else {
      toast.error(t("error.parseError"));
    }
  };

  const executeBatch = async () => {
    if (!session?.user?.name) {
      toast.error(t("error.loginFirst"));
      return;
    }

    if (!template.trim()) {
      toast.error(t("error.templateRequired"));
      return;
    }

    const currentTasksSnapshot = tasksRef.current;
    const usernamesToProcess = Object.keys(currentTasksSnapshot).filter(
      (u) =>
        currentTasksSnapshot[u].status === "pending" ||
        currentTasksSnapshot[u].status === "error",
    );
    if (usernamesToProcess.length === 0) {
      toast.info("No pending tasks to process.");
      setIsPending(false);
      return;
    }

    setIsPending(true);
    setProgress(0);

    try {
      // 0. Authenticate First
      const { key, useKeychain } = await authenticateOperation("posting");
      const currentAuthor = session?.user?.name;

      if (!currentAuthor) {
        toast.error(t("error.loginFirst"));
        setIsPending(false);
        return;
      }

      // 1. Fetch Latest Posts
      const total = usernamesToProcess.length;
      let fetchedCount = 0;
      const tempTasks = { ...currentTasksSnapshot };

      try {
        // Phase 1: Fetching
        for (const u of usernamesToProcess) {
          try {
            tempTasks[u] = { ...tempTasks[u], status: "fetching" };
            setTasks({ ...tempTasks });

            const posts = await sdsApi.getFeedByApiPath(
              `getPostsByAuthor/${u}`,
              "steem",
              1,
              0,
              1,
            );

            if (posts && posts.length > 0) {
              const post = posts[0];
              tempTasks[u] = {
                ...tempTasks[u],
                status: "ready",
                postAuthor: post.author,
                postPermlink: post.permlink,
              };
            } else {
              tempTasks[u] = {
                ...tempTasks[u],
                status: "error",
                error: "No posts found",
              };
            }
          } catch (err) {
            tempTasks[u] = {
              ...tempTasks[u],
              status: "error",
              error: "Fetch error",
            };
          } finally {
            setTasks({ ...tempTasks });
            fetchedCount++;
            setProgress(Math.round((fetchedCount / total) * 45));
            await AsyncUtils.sleep(2);
          }
        }

        // Phase 2: Filter and Verify
        const readyTasks = usernamesToProcess
          .map((u) => tempTasks[u])
          .filter((tk) => tk.status === "ready");

        if (readyTasks.length === 0) {
          toast.error(t("error.fetchPostsError"));
          setIsPending(false);
          return;
        }

        // 3. Broadcast individually (Phase 2)
        let broadcastedCount = 0;
        for (const task of readyTasks) {
          tempTasks[task.username] = {
            ...tempTasks[task.username],
            status: "broadcasting",
          };
          setTasks({ ...tempTasks });

          if (!task.postAuthor || !task.postPermlink) {
            tempTasks[task.username] = {
              ...tempTasks[task.username],
              status: "error",
              error: "Missing post details",
            };
            setTasks({ ...tempTasks });
            continue;
          }

          try {
            // Generate final body and sanitize
            const rawBody = template
              .replace(/{{\s*username\s*}}/gi, task.username)
              .replace(/{{\s*me\s*}}/gi, `@${currentAuthor}`);

            const finalBody = rawBody.replace(
              /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
              "",
            );

            if (!finalBody.trim()) {
              throw new Error("Empty comment body");
            }

            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            let permlink = generateReplyPermlink(task.postAuthor);
            if (permlink.length > 255) {
              permlink = `re-${timestamp}-${random}`;
            }
            const commentData = {
              parent_author: task.postAuthor,
              parent_permlink: task.postPermlink,
              author: currentAuthor,
              permlink: permlink,
              title: "",
              body: finalBody,
              json_metadata: makeJsonMetadataReply(),
            };

            await steemApi.publish(commentData, null, key, useKeychain);

            tempTasks[task.username] = {
              ...tempTasks[task.username],
              status: "success",
            };
          } catch (err: any) {
            console.error(`Status update error for @${task.username}:`, err);
            tempTasks[task.username] = {
              ...tempTasks[task.username],
              status: "error",
              error: err?.message || err?.toString() || "Broadcast Error",
            };
          } finally {
            setTasks({ ...tempTasks });
            broadcastedCount++;
            setProgress(
              50 + Math.round((broadcastedCount / readyTasks.length) * 50),
            );
            if (broadcastedCount < readyTasks.length) {
              await AsyncUtils.sleep(3);
            }
          }
        }

        setProgress(100);

        // Final success notification
        const successCount = Object.values(tempTasks).filter(
          (t) => t.status === "success",
        ).length;
        toast.success(t("success.broadcast"), {
          description: t("success.sent", { count: successCount }),
        });
      } catch (err) {
        console.log("ExecuteBatch Inner Error:", err);
      }
    } catch (err) {
      console.log("ExecuteBatch Outer Error:", err);
      toast.error(t("error.broadcastFailed"));
    } finally {
      setIsPending(false);
    }
  };

  const handleClearFailed = () => {
    setTasks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key].status === "error") {
          delete next[key];
        }
      });
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={MessageSquare}
        color="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-default-50/30 border-b border-default-200 py-3 px-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-primary rounded-full animate-pulse" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                  Configure Comments
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
                  {isBulkMode ? "View List" : t("bulkImport")}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {isBulkMode ? (
                <div className="space-y-4 animate-opacity">
                  <div className="flex bg-primary/5 border border-primary/20 text-primary p-4 rounded-lg gap-3 text-sm">
                    <Info size={20} className="shrink-0" />
                    <p className="opacity-90 leading-relaxed font-medium">
                      Paste a list of usernames. You can use {"{{ username }}"}{" "}
                      or {"{{ me }}"} to customize your message for each person.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2 items-end">
                      <Select
                        label={t("usernameSeparator")}
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
                    placeholder={t("bulkPlaceholder")}
                    value={bulkInput}
                    onValueChange={setBulkInput}
                    variant="bordered"
                    classNames={{ input: "font-mono text-sm" }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      color="primary"
                      className="font-bold uppercase tracking-widest text-[10px]"
                      onPress={handleParseBulk}
                    >
                      {t("parseList")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <Zap size={14} className="text-primary" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-muted">
                          Message Template
                        </span>
                      </div>
                      <Textarea
                        minRows={6}
                        placeholder={"Hi @{{username}}, great post! - @{{me}}"}
                        value={template}
                        onValueChange={setTemplate}
                        isDisabled={isPending}
                        variant="bordered"
                        classNames={{
                          input: "text-sm font-medium leading-relaxed",
                          inputWrapper: "bg-content1/50",
                        }}
                      />
                    </div>
                    <Card className="bg-default-50/50 border border-default-200/50 rounded-lg shadow-none">
                      <CardBody className="p-4 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-2">
                          <Hash size={12} /> {t("variables.title")}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex justify-between items-center text-[10px] bg-content1/80 p-2 rounded-lg border border-default-200/50">
                            <code className="text-primary font-black">
                              {"{{username}}"}
                            </code>
                            <span className="text-muted">
                              {t("variables.username")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] bg-content1/80 p-2 rounded-lg border border-default-200/50">
                            <code className="text-primary font-black">
                              {"{{me}}"}
                            </code>
                            <span className="text-muted">
                              {t("variables.me")}
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <AnimatePresence>
            {(isPending || Object.keys(tasks).length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-2"
              >
                <Card className="border border-default-200 rounded-lg shadow-none bg-[#0a0a0a] text-default-300">
                  <CardHeader className="flex flex-row justify-between items-center border-b border-default-800 py-2.5 px-4 bg-default-900/10">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-primary">
                        Live Progress Log
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-default-600 uppercase tracking-widest">
                      System Status: Online
                    </div>
                  </CardHeader>
                  <CardBody className="p-0 max-h-[350px] overflow-y-auto font-mono text-[11px] custom-scrollbar">
                    <div className="px-4 py-3 space-y-1">
                      {Object.values(tasks).map((task, i) => (
                        <div
                          key={task.username}
                          className="flex flex-wrap sm:flex-nowrap gap-x-4 gap-y-1 border-b border-default-800/20 py-2 last:border-0 group hover:bg-white/5 transition-colors"
                        >
                          <span className="text-default-700 w-8 shrink-0 select-none">
                            [{String(i + 1)}]
                          </span>
                          <span className="text-primary/80 lowercase w-24 sm:w-28 shrink-0 truncate">
                            @{task.username}
                          </span>
                          <div className="grow flex items-center gap-2 min-w-0 pr-2">
                            {task.status === "pending" && (
                              <span className="text-default-600">
                                Waiting...
                              </span>
                            )}
                            {task.status === "fetching" && (
                              <span className="text-primary animate-pulse italic">
                                Finding latest post...
                              </span>
                            )}
                            {task.status === "ready" && (
                              <span className="text-success/50">
                                Ready to send
                              </span>
                            )}
                            {task.status === "broadcasting" && (
                              <span className="text-warning animate-pulse font-bold tracking-tight">
                                Sending...
                              </span>
                            )}
                            {task.status === "success" && (
                              <span className="text-success font-bold">
                                Commented
                              </span>
                            )}
                            {task.status === "error" && (
                              <span className="text-danger font-bold">
                                Failed: {task.error}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-default-800 hidden md:block">
                            {moment().format("HH:mm:ss")}
                          </span>
                        </div>
                      ))}
                      {usernames.length === 0 && (
                        <div className="py-16 text-center opacity-20 select-none uppercase tracking-[0.4em] text-[10px]">
                          Enter usernames above to start
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4 relative"
        >
          <div className="sticky top-20">
            <Card className="border border-default-200 rounded-lg shadow-2xl shadow-primary/5 bg-content1/40 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/30 via-primary to-primary/30" />
              <CardHeader className="bg-default-50/20 border-b border-default-200 py-3 px-4 flex flex-wrap justify-between items-center gap-2">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                  Live Progress
                </span>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  className="font-bold text-[9px] uppercase tracking-widest h-6"
                  onPress={handleClearFailed}
                  isDisabled={
                    isPending ||
                    !Object.values(tasks).some((t) => t.status === "error")
                  }
                >
                  Clear Failed
                </Button>
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 group-hover:text-primary transition-colors">
                    <Activity size={12} /> Recipients
                  </span>
                  <span className="font-mono text-sm font-bold bg-content1 px-2 py-0.5 rounded border border-default-200 shadow-inner">
                    {usernames.length}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                    <span>Total Progress</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <Progress
                    aria-label="Comment Progress"
                    color="primary"
                    size="sm"
                    value={progress}
                    className="h-1.5"
                    classNames={{
                      indicator:
                        "bg-primary shadow-[0_0_10px_rgba(var(--heroui-primary),0.6)]",
                    }}
                  />
                  <div className="flex justify-between font-mono text-[9px] text-muted">
                    <span>STATUS: {isPending ? "SENDING" : "READY"}</span>
                    <span>SYNC: {progress === 100 ? "DONE" : "PENDING"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-default-50/50 p-3 rounded-lg border border-default-200/50 text-center backdrop-blur-sm">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                      Delivered
                    </div>
                    <div className="text-sm font-bold text-success">
                      {
                        Object.values(tasks).filter(
                          (t) => t.status === "success",
                        ).length
                      }
                    </div>
                  </div>
                  <div className="bg-default-50/50 p-3 rounded-lg border border-default-200/50 text-center backdrop-blur-sm">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                      Failed
                    </div>
                    <div className="text-sm font-bold text-danger">
                      {
                        Object.values(tasks).filter((t) => t.status === "error")
                          .length
                      }
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    color="primary"
                    className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-600 transition-colors"
                    endContent={!isPending && <Play size={16} />}
                    isDisabled={usernames.length === 0 || isPending}
                    isLoading={isPending}
                    onPress={executeBatch}
                  >
                    Initiate Broadcast
                  </Button>
                </motion.div>

                {isPending && (
                  <p className="text-[9px] text-center text-muted font-mono animate-pulse uppercase tracking-widest">
                    Sending comments, please wait...
                  </p>
                )}
              </CardBody>
            </Card>

            <div className="mt-4 p-4 bg-default-50/50 backdrop-blur-sm rounded-lg border border-default-200 group hover:border-primary/20 transition-colors">
              <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-3 flex items-center gap-2">
                <Terminal size={12} className="text-primary" /> Important Notes
              </h4>
              <ul className="text-[9px] text-muted space-y-2.5 font-medium leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-primary">01</span>
                  <span>
                    Automatically fetching the latest post for each username.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">02</span>
                  <span>
                    Short delays added between comments to prevent errors.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">03</span>
                  <span>
                    Supports custom variables like {"{{username}}"} in comments.
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
