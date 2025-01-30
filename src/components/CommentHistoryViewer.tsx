import { useEffect, useState } from "react";
import diff_match_patch from "diff-match-patch";
import { useQuery } from "@tanstack/react-query";
import { getCommentHistory } from "@/libs/steem/sds";
import { toast } from "sonner";
import LoadingCard from "./LoadingCard";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";

import MarkdownViewer from "./body/MarkdownViewer";
import { FaHistory } from "react-icons/fa";

import { MdSubject } from "react-icons/md";
import moment from "moment";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { PiHashFill } from "react-icons/pi";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  author: string;
  permlink: string;
}

interface CommentHistoryItem {
  title: string;
  titleDiff?: string;
  body: string;
  bodyDiff?: string;
  tags: string;
  tagsDiff?: string;
  time: string;
}

const dmp = new diff_match_patch();

const calculateDiff = (oldStr: string, newStr: string): string => {
  const diffs = dmp.diff_main(oldStr || "", newStr || "");
  dmp.diff_cleanupSemantic(diffs);
  return dmp.diff_prettyHtml(diffs).replace(/&para;/g, "&nbsp;");
};

const processHistoryData = (rawData: string[]): CommentHistoryItem[] => {
  const history: CommentHistoryItem[] = [];
  let previousBody = "";

  rawData.forEach((entry: any, index) => {
    const currentBody = entry.body.startsWith("@@")
      ? dmp.patch_apply(dmp.patch_fromText(entry.body), previousBody)[0]
      : entry.body;
    previousBody = currentBody;

    const metadata = entry.json_metadata ? JSON.parse(entry.json_metadata) : {};
    history.push({
      title: entry.title,
      body: currentBody,
      time: entry.time,
      tags: metadata.tags?.join(", ") || "",
      titleDiff:
        index > 0 ? calculateDiff(history[index - 1].title, entry.title) : "",
      tagsDiff:
        index > 0
          ? calculateDiff(history[index - 1].tags, metadata.tags?.join(", "))
          : "",
      bodyDiff:
        index > 0 ? calculateDiff(history[index - 1].body, currentBody) : "",
    });
  });

  return history;
};

const CommentEditHistory: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  author,
  permlink,
}) => {
  const {
    data: historyData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`comment_history_${author}_${permlink}`],
    queryFn: () => getCommentHistory(author, permlink),
  });

  const [history, setHistory] = useState<CommentHistoryItem[]>([]);
  const [showDiff, setShowDiff] = useState<boolean[]>([]);
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (historyData) {
      const processedData = processHistoryData(historyData);
      setHistory(processedData);
      setShowDiff(Array(processedData.length).fill(false));
    }
    if (isError) {
      toast.error(`Failed to load history: ${error}`);
    }
  }, [historyData, isError, error]);

  const toggleDiff = (index: number, checked: boolean) => {
    setShowDiff((prev) =>
      prev.map((value, i) => (i === index ? checked : value))
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="mt-4"
      scrollBehavior="inside"
      backdrop="blur"
      size="2xl"
      hideCloseButton
      placement="top"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit History
            </ModalHeader>
            <ModalBody className="pb-4 overflow-x-clip">
              {isLoading && <LoadingCard />}
              {!isLoading && (
                <Tabs
                  variant="light"
                  radius={isMobile ? "full" : "sm"}
                  disableAnimation={isMobile}
                  size="sm"
                  aria-label="Edit History Tabs"
                >
                  {history.map((item: any, index) => (
                    <Tab key={index} title={`Version ${index + 1}`}>
                      <div className="flex flex-col gap-2">
                        <Checkbox
                          isSelected={showDiff[index]}
                          checked={showDiff[index]}
                          onValueChange={(checked) =>
                            toggleDiff(index, checked)
                          }
                          title="Show difference"
                        >
                          Show difference
                        </Checkbox>
                        <div className="w-full p-4 bg-foreground/20 rounded-md flex flex-row gap-2 items-center">
                          <FaHistory className="text-sm" />
                          {moment(item.time * 1000)
                            .locale("en")
                            .format("lll")}
                        </div>
                        <div className="flex flex-col text-gray-500 gap-2">
                          {item.titleDiff && (
                            <div className=" flex flex-row items-center justify-start gap-2">
                              <MdSubject
                                size={24}
                                className=" text-foreground"
                              />
                              <MarkdownViewer
                                className="text-lg"
                                text={
                                  showDiff[index]
                                    ? item.titleDiff || ""
                                    : item.title
                                }
                              />
                            </div>
                          )}

                          {item.tagsDiff && (
                            <div className=" flex flex-row items-center justify-start  gap-2">
                              <PiHashFill
                                size={24}
                                className=" text-foreground"
                              />
                              <MarkdownViewer
                                text={
                                  showDiff[index]
                                    ? item.tagsDiff || ""
                                    : item.tags || ""
                                }
                              />
                            </div>
                          )}

                          {showDiff[index] ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item.bodyDiff || "",
                              }}
                            />
                          ) : (
                            <MarkdownViewer text={item.body} />
                          )}
                        </div>
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose} size="sm">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CommentEditHistory;
