"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Listbox,
  ListboxItem,
  ScrollShadow,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import { sdsApi } from "@/libs/sds";
import moment from "moment";
import { diff_match_patch as diffMatchPatch } from "diff-match-patch";
import { History, ArrowLeftRight, FileText, Tag } from "lucide-react";
import LoadingStatus from "@/components/LoadingStatus";
import MarkdownViewer from "./body/MarkdownViewer";

interface HistoryItem {
  time: number;
  json_metadata: string;
  title: string;
  body: string;
  tags: string[];
}

const dmp = new diffMatchPatch();

// Pure function for data processing
const processHistory = (rawData: any[]): HistoryItem[] => {
  let [b, t, m, tg] = ["", "", "", [] as string[]];
  return rawData
    .sort((a, b) => a.time - b.time)
    .map((entry) => {
      try {
        b = entry.body.startsWith("@@")
          ? dmp.patch_apply(dmp.patch_fromText(entry.body), b)[0]
          : entry.body;
        t = entry.title || t || "";
        m = entry.json_metadata || m || "";
        try {
          tg = m ? JSON.parse(m).tags || tg : tg;
        } catch {}
        return {
          time: entry.time,
          json_metadata: m,
          title: t,
          body: b,
          tags: tg,
        };
      } catch {
        return {
          time: entry.time,
          json_metadata: m || "",
          title: t || "",
          body: entry.body || "",
          tags: tg,
        };
      }
    });
};

const Section = memo(
  ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <section className="space-y-3">
      <h4 className="text-tiny uppercase font-bold text-muted tracking-wider flex items-center gap-2">
        {icon || <div className="w-1 h-3 bg-primary rounded-full" />} {title}
      </h4>
      {children}
    </section>
  )
);
Section.displayName = "Section";

const DiffContent = memo(
  ({ oldText = "", newText = "" }: { oldText: string; newText: string }) => {
    const diffs = useMemo(() => {
      const d = dmp.diff_main(oldText, newText);
      dmp.diff_cleanupSemantic(d);
      return d;
    }, [oldText, newText]);

    return (
      <div className="whitespace-pre-wrap font-mono text-sm wrap-break-word p-4 bg-content2 rounded-lg border border-divider leading-relaxed">
        {diffs.map(([op, text], i) => (
          <span
            key={i}
            className={
              op === 1
                ? "bg-success/20 text-success-700 border-b-2 border-success-400 rounded px-0.5"
                : op === -1
                ? "bg-danger/20 text-danger-700 line-through decoration-danger-400/50 decoration-2 rounded px-0.5"
                : ""
            }
          >
            {text}
          </span>
        ))}
      </div>
    );
  }
);
DiffContent.displayName = "DiffContent";

const TagsDiff = memo(
  ({
    oldTags = [],
    newTags = [],
  }: {
    oldTags: string[];
    newTags: string[];
  }) => {
    const oldSet = new Set(oldTags),
      newSet = new Set(newTags);
    return (
      <div className="flex flex-wrap gap-2 p-4 bg-content2 rounded-lg border border-divider">
        {newTags
          .filter((t) => oldSet.has(t))
          .map((t) => (
            <Chip key={t} size="sm" variant="flat">
              {t}
            </Chip>
          ))}
        {newTags
          .filter((t) => !oldSet.has(t))
          .map((t) => (
            <Chip key={`${t}-a`} size="sm" color="success" variant="flat">
              + {t}
            </Chip>
          ))}
        {oldTags
          .filter((t) => !newSet.has(t))
          .map((t) => (
            <Chip key={`${t}-r`} size="sm" color="danger" variant="flat">
              - {t}
            </Chip>
          ))}
      </div>
    );
  }
);
TagsDiff.displayName = "TagsDiff";

export default function EditHistoryModal({
  isOpen,
  onOpenChange,
  author,
  permlink,
}: any) {
  const [data, setData] = useState<{
    history: HistoryItem[];
    loading: boolean;
  }>({ history: [], loading: true });
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"content" | "diff">("content");
  const [compare, setCompare] = useState<"previous" | "original">("previous");

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      setData((prev) => ({ ...prev, loading: true }));
      try {
        const res = await sdsApi.getContentHistory(author, permlink);
        if (active) {
          const processed = processHistory(res || []);
          setData({ history: processed, loading: false });
          setIndex(processed.length - 1);
        }
      } catch {
        if (active) setData({ history: [], loading: false });
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen, author, permlink]);

  const current = data.history[index],
    prev = index > 0 ? data.history[index - 1] : null,
    original = data.history[0];
  const compareTarget = compare === "original" ? original : prev;

  useEffect(() => {
    if (!compareTarget && view === "diff") setView("content");
  }, [compareTarget, view]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{ base: "max-h-[85vh]", body: "p-0" }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 border-b border-divider items-center">
              <History size={20} />
              <div className="flex flex-wrap gap-1">
                Edit History
                <span className="text-small font-normal text-muted truncate">
                  @{author}/{permlink}
                </span>
              </div>
            </ModalHeader>
            <ModalBody>
              {data.loading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingStatus />
                </div>
              ) : !data.history.length ? (
                <div className="h-64 flex items-center justify-center text-muted">
                  No history found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                  <div className="md:col-span-3 border-r border-divider bg-content1/50">
                    <ScrollShadow className="h-full max-h-[60vh] md:max-h-[calc(85vh-120px)] p-2">
                      <Listbox
                        aria-label="Versions"
                        variant="flat"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={new Set([index.toString()])}
                        onSelectionChange={(k) => {
                          const val = Array.from(k as Set<string>)[0];
                          if (val !== undefined) setIndex(Number(val));
                        }}
                      >
                        {data.history.map((h, i) => (
                          <ListboxItem
                            key={i}
                            description={
                              i === data.history.length - 1
                                ? "Current"
                                : i === 0
                                ? "Original"
                                : `Version ${i + 1}`
                            }
                            startContent={
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  i === index
                                    ? "bg-primary shadow-[0_0_8px_rgba(var(--heroui-primary-rgb),.6)]"
                                    : i === 0
                                    ? "bg-secondary"
                                    : "bg-default-300"
                                }`}
                              />
                            }
                          >
                            {moment.unix(h.time).format("MMM DD, HH:mm")}
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </ScrollShadow>
                  </div>
                  <div className="md:col-span-9 flex flex-col min-h-0 h-full max-h-[calc(85vh-120px)]">
                    <div className="p-4 border-b border-divider flex flex-wrap gap-2 justify-between items-center bg-content1">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate">
                          {current?.title || "Untitled"}
                        </span>
                        <span className="text-tiny text-muted">
                          {moment.unix(current?.time).format("LLLL")}
                        </span>
                      </div>
                      <Tabs
                        size="sm"
                        selectedKey={view}
                        onSelectionChange={(k) => setView(k as any)}
                        color="primary"
                        variant="bordered"
                      >
                        <Tab
                          key="content"
                          title={
                            <div className="flex items-center gap-2">
                              <FileText size={14} /> Version
                            </div>
                          }
                        />
                        <Tab
                          key="diff"
                          title={
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight size={14} /> Diff
                            </div>
                          }
                          disabled={!compareTarget}
                        />
                      </Tabs>
                    </div>
                    {view === "diff" && compareTarget && (
                      <div className="px-4 py-2 border-b border-divider bg-content2/30 flex justify-between items-center">
                        <span className="text-tiny text-muted">
                          Comparing with:{" "}
                          <b>
                            {compare === "original" ? "Original" : "Previous"}
                          </b>
                        </span>
                        <div className="flex gap-1">
                          {["previous", "original"].map((m) => (
                            <Button
                              key={m}
                              size="sm"
                              variant={compare === m ? "solid" : "bordered"}
                              color="primary"
                              className="h-6 text-[10px]"
                              onPress={() => setCompare(m as any)}
                              disabled={m === "original" && index === 0}
                            >
                              {m}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <ScrollShadow className="flex-1 p-6 space-y-6">
                      {view === "content" ? (
                        <>
                          {current.tags.length > 0 && (
                            <Section title="Tags" icon={<Tag size={14} />}>
                              <div className="flex flex-wrap gap-2">
                                {current.tags.map((t) => (
                                  <Chip key={t} size="sm" variant="flat">
                                    {t}
                                  </Chip>
                                ))}
                              </div>
                            </Section>
                          )}
                          <Section title="Title">
                            <div className="text-lg font-semibold p-4 bg-content2 rounded-lg border border-divider">
                              {current.title}
                            </div>
                          </Section>
                          <Section title="Content">
                            <MarkdownViewer body={current.body} />
                          </Section>
                        </>
                      ) : (
                        compareTarget && (
                          <>
                            <Section
                              title="Tags Changes"
                              icon={<Tag size={14} />}
                            >
                              <TagsDiff
                                oldTags={compareTarget.tags}
                                newTags={current.tags}
                              />
                            </Section>
                            <Section title="Title Changes">
                              <DiffContent
                                oldText={compareTarget.title}
                                newText={current.title}
                              />
                            </Section>
                            <Section title="Body Changes">
                              <DiffContent
                                oldText={compareTarget.body}
                                newText={current.body}
                              />
                            </Section>
                          </>
                        )
                      )}
                    </ScrollShadow>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-divider">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
