import {
  MessageCircle,
  FileText,
  Flag,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Rocket,
} from "lucide-react";
import { Button } from "@heroui/button";
import PostVoteButton from "@/components/post/PostVoteButton";
import ShareButton from "../ui/ShareButton";
import { Constants } from "@/constants";
import SPopover from "../ui/SPopover";
import BoostModal from "../post/BoostModal";
import { useState, useRef } from "react";
import MarkdownViewer from "@/components/post/body/MarkdownViewer";
import SModal from "../ui/SModal";
import VoteCountButton from "../ui/VoteCountButton";
import PayoutButton from "../post/PayoutButton";
import { isSteemProShort } from "@/utils";
import CommentsList from "../comments/CommentsList";
import { Textarea } from "@heroui/input";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { useDraggable } from "@heroui/use-draggable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@heroui/react";

interface Props {
  short: ShortVideo;
}

export default function ShortsActions({ short }: Props) {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (s) => s.commonReducer.values.isShortsCollapsed,
  );
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const { data: session } = useSession();
  const shareUrl = `${Constants.site_url}/shorts/@${short.author}/${short.permlink}`;

  const commentTargetRef = useRef<any>(null);
  const { moveProps } = useDraggable({
    targetRef: commentTargetRef,
    isDisabled: !isCommentsOpen,
  });

  const submitReport = async () => {
    setIsReporting(true);
    try {
      const res = await fetch("/api/shorts/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: short.author,
          permlink: short.permlink,
          note: reportNote,
          reporter: session?.user?.name,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        "Report submitted. Thank you for helping keep our community safe!",
      );
      setIsReportModalOpen(false);
      setReportNote("");
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const actionBtnClass =
    "text-inherit transition-all duration-300 active:scale-90 h-10 w-10 min-w-0";

  return (
    <Card
      isBlurred
      className="flex flex-col items-center gap-4 z-20 pointer-events-auto rounded-full bg-transparent xl:bg-default text-white md:text-default-900!"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col p-1 text-inherit items-cente transition-all duration-300 overflow-hidden">
        <Accordion
          selectedKeys={isCollapsed ? [] : ["actions"]}
          className="p-0 flex flex-col items-center gap-4!"
          hideIndicator
          showDivider={false}
        >
          <AccordionItem
            key="actions"
            aria-label="Actions Container"
            className="p-0 border-none w-full"
            classNames={{
              content: "p-0 flex flex-col items-center gap-4",
              title: "hidden",
              trigger: "hidden",
            }}
          >
            {/* Vote & Counter */}
            <div className="flex flex-col items-center pt-2 ">
              <PostVoteButton
                comment={short}
                radius="full"
                variant="light"
                className={actionBtnClass}
              />
              <VoteCountButton
                comment={short}
                size="sm"
                variant="light"
                radius="sm"
                labelClass="text-xs"
                className="min-w-0 h-6 px-1 text-inherit"
              />
            </div>

            {/* Comments */}
            <div className="flex flex-col items-center group">
              <Button
                isIconOnly
                radius="full"
                variant="light"
                onPress={() => setIsCommentsOpen(true)}
                className={actionBtnClass}
                aria-label="Open Comments"
              >
                <MessageCircle size={22} strokeWidth={2.5} />
              </Button>
              <span className="text-xs mt-0.5">{short.children}</span>
            </div>

            {/* Payout */}
            <PayoutButton
              className="max-w-10 min-w-0 text-inherit flex items-center justify-center h-14 w-full"
              labelClass="flex flex-col items-center gap-2 text-xs"
              comment={short}
              variant="light"
            />

            {/* Share */}
            <ShareButton
              url={shareUrl}
              isIconOnly
              radius="full"
              variant="light"
              buttonTitle=""
              className={actionBtnClass}
            />

            {/* More Options */}
            <SPopover
              trigger={
                <Button
                  isIconOnly
                  radius="full"
                  variant="light"
                  className={actionBtnClass}
                  aria-label="More Options"
                >
                  <MoreHorizontal size={22} strokeWidth={2.5} />
                </Button>
              }
            >
              {(close) => (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="light"
                    className="justify-start gap-4"
                    onPress={() => {
                      close();
                      setIsDescriptionOpen(true);
                    }}
                    startContent={
                      <FileText size={18} className="text-primary" />
                    }
                  >
                    Description
                  </Button>
                  <Button
                    variant="light"
                    color="danger"
                    className="justify-start gap-4"
                    onPress={() => {
                      close();
                      setIsReportModalOpen(true);
                    }}
                    startContent={<Flag size={18} />}
                  >
                    Report
                  </Button>
                  <Button
                    variant="light"
                    className="justify-start gap-4"
                    onPress={() => {
                      close();
                      setIsBoostModalOpen(true);
                    }}
                    startContent={<Rocket size={18} className="text-warning" />}
                  >
                    Boost
                  </Button>
                </div>
              )}
            </SPopover>
          </AccordionItem>
        </Accordion>

        {/* Fullscreen / Collapse Toggle */}
        <Button
          isIconOnly
          radius="full"
          variant="light"
          size="sm"
          onPress={() =>
            dispatch(addCommonDataHandler({ isShortsCollapsed: !isCollapsed }))
          }
          className={actionBtnClass}
          aria-label={isCollapsed ? "Show Actions" : "Hide Actions"}
        >
          {isCollapsed ? (
            <Maximize2 size={20} strokeWidth={2.5} />
          ) : (
            <Minimize2 size={20} strokeWidth={2.5} />
          )}
        </Button>
      </div>

      {/* Description Modal */}
      <SModal
        title="Description"
        isOpen={isDescriptionOpen}
        onOpenChange={setIsDescriptionOpen}
        scrollBehavior="inside"
        size="lg"
      >
        {() => (
          <div className="pb-6">
            <MarkdownViewer
              body={short.body}
              isShort={isSteemProShort(short)}
              shortsUrl=""
            />
          </div>
        )}
      </SModal>

      {/* Report Modal */}
      <SModal
        title="Report Content"
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        size="md"
      >
        {() => (
          <div className="flex flex-col gap-4 pb-6">
            <div className="p-3 bg-danger-50 text-danger rounded-xl text-xs font-semibold border border-danger-100 italic">
              Please provide details about what is inappropriate in this video.
              Reports are taken seriously by our moderation team.
            </div>
            <Textarea
              label="Why are you reporting this short?"
              placeholder="Provide a brief explanation (optional)"
              variant="flat"
              value={reportNote}
              onValueChange={setReportNote}
              className="max-w-full"
              labelPlacement="outside"
              minRows={3}
            />
            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="light"
                onPress={() => setIsReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={submitReport}
                isLoading={isReporting}
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </SModal>

      {/* Comments Slide-up Modal */}
      <SModal
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        scrollBehavior="inside"
        placement="bottom"
        title="Comments"
        size="lg"
        ref={commentTargetRef}
        moveProps={moveProps}
        backdrop="transparent"
        classNames={{ body: "p-2" }}
      >
        {() => (
          <div className="pb-10 pt-2 px-1">
            <div className="w-12 h-1 bg-default-300 rounded-full mx-auto mb-6 opacity-40 sm:hidden" />
            <CommentsList root={short as any} />
          </div>
        )}
      </SModal>

      {/* Boost Modal */}
      <BoostModal
        isOpen={isBoostModalOpen}
        onOpenChange={setIsBoostModalOpen}
        post={short}
      />
    </Card>
  );
}
