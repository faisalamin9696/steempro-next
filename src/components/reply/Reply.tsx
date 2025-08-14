"use client";

import ReplyForm from "./ReplyForm";
import { memo, useEffect, useRef, useState } from "react";
import SAvatar from "@/components/ui/SAvatar";
import { useAppSelector } from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import { BiVerticalTop } from "react-icons/bi";
import "./style.css";
import { twMerge } from "tailwind-merge";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useTranslation } from "@/utils/i18n";

interface Props {
  comment: Post;
  rootComment: Post | Feed;
}

export default memo(function Reply(props: Props) {
  const { comment } = props;
  const { t } = useTranslation();
  const commentInfo: Post = (useAppSelector(
    (state) => state.commentReducer.values
  )[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
  const [expanded, setExpanded] = useState(false);
  const { isMobile } = useDeviceInfo();
  const [showGotoButton, setShowGotoButton] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);
  const headerHeight = 80; // Adjust to match your header height

  useEffect(() => {
    const handleScroll = () => {
      const currentAvatar = avatarRef.current;
      const currentComment = commentRef.current;

      if (!currentAvatar || !currentComment) return;

      const avatarRect = currentAvatar.getBoundingClientRect();
      const commentRect = currentComment.getBoundingClientRect();

      // Avatar is sticky when its top position equals headerHeight
      const isAvatarSticky = avatarRect.top <= headerHeight;

      // Comment is out of view when its top is above the viewport
      const isCommentOutOfView = commentRect.top < 0;

      // Only show button when avatar is sticky AND comment is scrolled up
      setShowGotoButton(isAvatarSticky && isCommentOutOfView);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex-col w-full relative">
      <div
        ref={commentRef}
        className="flex gap-2 relative"
        id={commentInfo.link_id.toString()}
      >
        {!commentInfo.link_id ? null : (
          <>
            {/* Sticky avatar & line container */}
            <div
              ref={avatarRef}
              className={twMerge(
                "flex flex-col gap-2 items-center",
                "sm:sticky sm:top-20 sm:h-min sm:self-start"
              )}
            >
              <SAvatar
                size="1xs"
                username={commentInfo.author}
                className="hidden sm:block"
              />
              {expanded &&
                commentInfo?.depth >= 1 &&
                !!commentInfo.children &&
                (isMobile ? (
                  <div className="w-[1px] border-default-200 h-full bg-foreground/10 " />
                ) : (
                  showGotoButton && (
                    <Button
                      className="transition-opacity duration-200"
                      onPress={() => {
                        const section = document.getElementById(
                          commentInfo.link_id.toString()
                        );
                        if (section) {
                          section.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "center",
                          });
                        }
                      }}
                      color="default"
                      variant="flat"
                      isIconOnly
                      size="sm"
                      radius="full"
                    >
                      <BiVerticalTop size={20} />
                    </Button>
                  )
                ))}
            </div>

            {/* Content area */}
            <div className="flex-1 flex items-start gap-2 w-full">
              <ReplyForm
                {...props}
                isExpanded={setExpanded}
                comment={commentInfo}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
});
