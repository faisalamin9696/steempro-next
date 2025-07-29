import { useEffect, useState } from "react";
import diff_match_patch from "diff-match-patch";
import { getCommentHistory } from "@/libs/steem/sds";
import LoadingCard from "./LoadingCard";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import MarkdownViewer from "./body/MarkdownViewer";
import { FaHistory } from "react-icons/fa";
import { MdSubject } from "react-icons/md";
import moment from "moment";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { PiHashFill } from "react-icons/pi";
import useSWR from "swr";
import ErrorCard from "./ErrorCard";
import SModal from "./ui/SModal";

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
    try {
      const currentBody = entry.body.startsWith("@@")
        ? dmp.patch_apply(dmp.patch_fromText(entry.body), previousBody)[0]
        : entry.body;
      previousBody = currentBody;

      const metadata = entry?.json_metadata
        ? JSON.parse(entry.json_metadata)
        : {};

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
    } catch (error) {}
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
    error,
  } = useSWR(`comment_history_${author}_${permlink}`, () =>
    getCommentHistory(author, permlink)
  );

  const [history, setHistory] = useState<CommentHistoryItem[]>([]);
  const [showDiff, setShowDiff] = useState<boolean[]>([]);
  const { isMobile } = useDeviceInfo();

  if (error) return <ErrorCard />;

  useEffect(() => {
    if (historyData) {
      const processedData = processHistoryData(historyData);
      setHistory(processedData);
      setShowDiff(Array(processedData.length).fill(false));
    }
  }, [historyData]);

  const toggleDiff = (index: number, checked: boolean) => {
    setShowDiff((prev) =>
      prev.map((value, i) => (i === index ? checked : value))
    );
  };

  return (
    <SModal
      isOpen={isOpen}
      shouldDestroy
      onOpenChange={onOpenChange}
      modalProps={{ scrollBehavior: "inside", backdrop: "blur", size: "2xl" }}
      title={() => "Edit History"}
      body={() => (
        <div className="flex flex-col pb-4 overflow-x-clip">
          {isLoading && <LoadingCard />}
          {historyData && (
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
                      onValueChange={(checked) => toggleDiff(index, checked)}
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
                          <MdSubject size={24} className=" text-foreground" />
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
                          <PiHashFill size={24} className=" text-foreground" />
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
        </div>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="flat" onPress={onClose}>
          Close
        </Button>
      )}
    />
  );
};

export default CommentEditHistory;
