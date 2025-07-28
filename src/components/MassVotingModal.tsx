"use client";

import { Button } from "@heroui/button";
import React, { useEffect, useRef, useState } from "react";
import { voteComment } from "@/libs/steem/condenser";
import { toast } from "sonner";
import { empty_comment } from "@/constants/Placeholders";
import STooltip from "./ui/STooltip";
import { FaCheckCircle } from "react-icons/fa";
import { TiWarning } from "react-icons/ti";
import { PiArrowArcRightFill } from "react-icons/pi";
import { AsyncUtils } from "@/utils/async.utils";
import SModal from "./ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleOnComplete?: () => void;
  data: {
    voter_account: AccountExt;
    voter_key: string;
    weight: string;
  };
  links: string[];
}

type LinkStatusType = "pending" | "success" | "failed";

const all_links: string[] = [];

export default function MassVotingModal(props: Props) {
  const { isOpen, data, links, onOpenChange, handleOnComplete } = props;
  const linkRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const isKeychain = data.voter_key === "keychain";

  const setRef = (item: string) => (el: HTMLDivElement | null) => {
    linkRefs.current[item] = el;
  };

  const [completed, setCompleted] = useState(false);

  const [linksStatus, setLinksStatus] = useState<
    { [x: string]: { status: LinkStatusType; error?: string } }[]
  >([]);

  useEffect(() => {
    // update the linksStatus object with pending status
    setLinksStatus(
      links.map((item) => {
        return { [item]: { status: "pending" } };
      })
    );

    all_links.length = 0;
    // check if data length is same to prevent duplication
    all_links.push(...links);

    startVoting();
  }, []);

  function updateStatus(link: string, status: LinkStatusType, error?: string) {
    setLinksStatus((prevLinks) =>
      prevLinks.map((linkObj) =>
        linkObj[link] ? { ...linkObj, [link]: { status, error } } : linkObj
      )
    );
  }

  async function startVoting() {
    // concating the links to global links list
    const pending_post = all_links.shift();
    scrollToLink(pending_post);
    if (pending_post) {
      let [permlink, author] = pending_post?.split("/").reverse();
      author = author.replace("@", "");
      try {
        const response = await voteComment(
          data.voter_account,
          empty_comment(author, permlink),
          data.voter_key,
          parseFloat(data.weight),
          isKeychain
        );

        if (response) {
          updateStatus(pending_post, "success");
        }
      } catch (error) {
        updateStatus(pending_post, "failed", String(error));
      } finally {
        await AsyncUtils.sleep(3);
        if (all_links.length <= 0) {
          toast.success("Completed");
          setCompleted(true);
          handleOnComplete && handleOnComplete();
        } else {
          startVoting();
        }
      }
    }
  }

  const getItemStatus = (
    linkToFind: string
  ): { status: LinkStatusType; error?: string } | undefined => {
    for (let linkObj of linksStatus) {
      if (linkObj[linkToFind]) {
        return {
          status: linkObj[linkToFind].status,
          error: linkObj[linkToFind].error,
        };
      }
    }
    return undefined;
  };

  const scrollToLink = (link?: string) => {
    if (link) {
      const element = linkRefs.current[link];
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        hideCloseButton: true,
        size: "md",
        scrollBehavior: "inside",
      }}
      title={() => (completed ? "Completed" : "Links")}
      body={() => (
        <div className=" flex flex-col gap-4">
          {links.map((item, index) => {
            const itemStatus = getItemStatus(item);
            const status = itemStatus?.status || "pending";
            const error = itemStatus?.error;

            return (
              <div
                ref={setRef(item)}
                className=" flex gap-2 items-center justify-between"
                key={index ?? item}
              >
                <a className="text-sm overflow-hidden break-words">{item}</a>

                <div className="flex flex-row gap-1">
                  <STooltip content={error}>
                    <Button
                      isLoading={status === "pending"}
                      color={
                        status === "success"
                          ? "success"
                          : status === "failed"
                          ? "danger"
                          : "default"
                      }
                      variant="flat"
                      size="sm"
                      isIconOnly
                    >
                      {status === "success" ? (
                        <FaCheckCircle className="text-xl" />
                      ) : status === "failed" ? (
                        <TiWarning className="text-xl" />
                      ) : undefined}
                    </Button>
                  </STooltip>

                  {itemStatus?.status === "failed" && (
                    <Button
                      title="Retry"
                      isIconOnly
                      size="sm"
                      onPress={() => {
                        let [permlink, author] = item?.split("/").reverse();
                        author = author.replace("@", "");

                        setCompleted(false);
                        updateStatus(item, "pending");

                        voteComment(
                          data.voter_account,
                          empty_comment(author, permlink),
                          data.voter_key,
                          parseFloat(data.weight),
                          isKeychain
                        )
                          .then(() => {
                            updateStatus(item, "success");
                          })
                          .catch((e) => {
                            updateStatus(item, "failed", String(e));
                          })
                          .finally(() => {
                            setCompleted(true);
                          });
                      }}
                    >
                      <PiArrowArcRightFill className="text-xl" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="light" onPress={onClose}>
          Close
        </Button>
      )}
    />
  );
}
