import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import React, { memo, useState } from "react";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { SlLoop } from "react-icons/sl";
import { useMutation } from "@tanstack/react-query";
import {
  calculatePowerUsage,
  getCredentials,
  getSessionKey,
  getSettings,
  updateSettings,
} from "@/libs/utils/user";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useLogin } from "@/components/auth/AuthProvider";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";
import { toast } from "sonner";
import { reblogPost, voteComment } from "@/libs/steem/condenser";
import { getVoteData } from "@/libs/steem/sds";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import VotingModal from "@/components/VotingModal";
import { CommentProps } from "../CommentCard";
import {
  BiDownvote,
  BiSolidDownvote,
  BiSolidUpvote,
  BiUpvote,
} from "react-icons/bi";
import { abbreviateNumber } from "@/libs/utils/helper";
import { FaRegCommentAlt } from "react-icons/fa";

import { RewardBreakdownCard } from "@/components/RewardBreakdownCard";
import { twMerge } from "tailwind-merge";
import VotersCard from "@/components/VotersCard";
import "./style.scss";
import ClickAwayListener from "react-click-away-listener";
import { useSession } from "next-auth/react";
import { As } from "@heroui/react";
import SLink from "@/components/SLink";
import { AsyncUtils } from "@/libs/utils/async.utils";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onPress?: (event) => void;
  hoverable?: boolean;
  isDisabled?: boolean;
  as?: As;
  href?: string;
  passHref?: boolean;
}

export default memo(function CommentFooter(props: CommentProps) {
  const { comment, className, isReply, compact, isDetails } = props;

  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const voterDisclosure = useDisclosure();
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();

  const dispatch = useAppDispatch();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const isUpvoted =
    !!comment.observer_vote && comment.observer_vote_percent > 0;
  const isDownvoted =
    !!comment.observer_vote && comment.observer_vote_percent < 0;
  const isResteemd = !!comment.observer_resteem;

  const isVoting =
    comment.status === "upvoting" || comment.status === "downvoting";
  const [breakdownModal, setBreakdownModal] = useState(false);
  const [resteemPopup, setResteemPopup] = useState(false);
  const [upvotePopup, setUpvotePopup] = useState(false);
  const [downvotePopup, setDownvotePopup] = useState(false);

  function closeVotingModal() {
    if (upvotePopup) setUpvotePopup(false);
    if (downvotePopup) setDownvotePopup(false);
  }

  const voteMutation = useMutation({
    mutationFn: ({
      key,
      weight,
      isKeychain,
    }: {
      key: string;
      weight: number;
      isKeychain?: boolean;
    }) => voteComment(loginInfo, comment, key, weight, isKeychain),
    onSettled(data, error, variables, context) {
      const { weight } = variables;
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        dispatch(addCommentHandler({ ...comment, status: "idle" }));
        return;
      }

      const downvote = weight < 0;
      const vData = getVoteData(loginInfo, globalData);
      const remove = weight === 0;

      const vote_value =
        (weight / 100) *
        (vData.current_vote *
          (downvote
            ? loginInfo.downvote_mana_percent
            : loginInfo.upvote_mana_percent) *
          0.01);

      const newChanges: Post | Feed = {
        ...comment,
        observer_vote: remove ? 0 : 1,
        [downvote ? "downvote_count" : "upvote_count"]: downvote
          ? comment.downvote_count + 1
          : comment.upvote_count + 1,
        observer_vote_percent: weight,
        payout: remove
          ? comment.payout
          : comment.payout + (downvote ? -vote_value : vote_value),
        observer_vote_rshares: remove ? 0 : comment.observer_vote_rshares,
        status: "idle",
      };

      dispatch(addCommentHandler(newChanges));

      // update the login user data
      const downvote_per = downvote
        ? loginInfo.downvote_mana_percent - calculatePowerUsage(weight)
        : loginInfo.downvote_mana_percent;
      const upvote_per = !downvote
        ? loginInfo.upvote_mana_percent - calculatePowerUsage(weight)
        : loginInfo.upvote_mana_percent;
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          upvote_mana_percent: upvote_per,
          downvote_mana_percent: downvote_per,
        })
      );
      const settings = getSettings();

      if (settings.voteOptions.remember) {
        const voteToSave = downvote ? -weight : weight;
        updateSettings({
          ...settings,
          voteOptions: {
            remember: true,
            value: voteToSave,
          },
        });
      }

      if (variables.weight < 0) {
        return;
      }
    },
  });

  async function castVote(weight: number, downvote?: boolean) {
    closeVotingModal();

    if (downvote) {
      weight = -weight;
    }

    dispatch(
      addCommentHandler({
        ...comment,
        status: downvote ? "downvoting" : "upvoting",
      })
    );

    await AsyncUtils.sleep(0.25);
    try {
      const credentials = getCredentials(getSessionKey(session?.user?.name));
      if (!credentials?.key) {
        dispatch(addCommentHandler({ ...comment, status: "idle" }));
        toast.error("Invalid credentials");
        return;
      }
      voteMutation.mutate({
        key: credentials.key,
        weight,
        isKeychain: credentials.keychainLogin,
      });
    } catch (error: any) {
      toast.error(error.message || JSON.stringify(error));
      dispatch(addCommentHandler({ ...comment, status: "idle" }));
    }
  }

  const reblogMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      reblogPost(
        loginInfo,
        data.key,
        {
          author: comment.author,
          permlink: comment.permlink,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(addCommentHandler({ ...comment, observer_resteem: 1 }));
      toast.success("Resteemed");
    },
  });

  async function handleResteem() {
    authenticateUser();
    if (!isAuthorized()) return;
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    reblogMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  return (
    <div className={twMerge("flex flex-col p-1 gap-1 w-full ", className)}>
      <div
        className={twMerge(
          "flex flex-row max-xs:flex-col items-center max-xs:items-start gap-2",
          !isReply && "justify-between"
        )}
      >
        <div className={twMerge("flex", compact ? "gap-3" : "gap-4")}>
          <div className="flex flex-row items-center gap-2 relative  ">
            {(upvotePopup || downvotePopup) && (
              <ClickAwayListener onClickAway={closeVotingModal}>
                <div className="absolute animate-appearance-in z-[11] top-[-45px]">
                  <VotingModal
                    {...props}
                    downvote={downvotePopup}
                    onConfirm={castVote}
                  />
                </div>
              </ClickAwayListener>
            )}
            <ButtonWrapper>
              <Button
                radius="full"
                title="Upvote"
                variant="light"
                onPress={() => {
                  authenticateUser();
                  if (!isAuthorized()) {
                    return;
                  }
                  setUpvotePopup(!upvotePopup);
                }}
                isDisabled={isVoting}
                isLoading={comment.status === "upvoting"}
                isIconOnly
                size="sm"
                className={twMerge(isUpvoted && "text-success-400")}
              >
                {isUpvoted ? (
                  <BiSolidUpvote className={"text-lg"} />
                ) : (
                  <BiUpvote className="text-lg" />
                )}
              </Button>

              {!!comment.upvote_count && (
                <button
                  title={`${comment.upvote_count} Votes`}
                  className="text-tiny"
                  onClick={voterDisclosure.onOpen}
                >
                  {abbreviateNumber(comment.upvote_count)}
                </button>
              )}

              <Button
                isIconOnly
                size="sm"
                variant="light"
                title="Downvote"
                isDisabled={isVoting}
                isLoading={comment.status === "downvoting"}
                onPress={() => {
                  if (!isAuthorized()) {
                    authenticateUser();
                    return false;
                  }
                  setDownvotePopup(!downvotePopup);
                }}
                className={twMerge(isDownvoted && "text-danger-400")}
                radius="full"
              >
                {isDownvoted ? (
                  <BiSolidDownvote className="text-lg" />
                ) : (
                  <BiDownvote className="text-lg" />
                )}
              </Button>
            </ButtonWrapper>

            {!isReply && !compact && (
              <ButtonWrapper
                href={
                  isDetails
                    ? undefined
                    : `/${comment.category}/@${comment.author}/${comment.permlink}#comments`
                }
                as={isDetails ? undefined : SLink}
                passHref={!isDetails}
                hoverable
                className={twMerge("px-2")}
                onPress={() =>
                  isDetails &&
                  document
                    .getElementById(`comments`)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                title={`${comment.children} Comments`}
              >
                <Button
                  className=" cursor-default disabled:text-default-foreground disabled:opacity-90"
                  title="Comments"
                  isDisabled
                  radius="full"
                  isIconOnly
                  size="sm"
                  variant="light"
                >
                  <FaRegCommentAlt className="text-lg" />
                </Button>

                {!!comment.children && (
                  <div className="text-tiny">
                    {abbreviateNumber(comment.children)}
                  </div>
                )}
              </ButtonWrapper>
            )}

            {!isReply && (
              <ButtonWrapper
                title={`${comment.resteem_count} Resteems`}
                hoverable
                onPress={() => setResteemPopup(!resteemPopup)}
                isDisabled={reblogMutation.isPending}
              >
                <Popover
                  isOpen={resteemPopup}
                  onOpenChange={setResteemPopup}
                  placement={"top-start"}
                >
                  <PopoverTrigger>
                    <Button
                      title="Resteem"
                      className={twMerge(
                        "min-w-0  shadow-lg cursor-default disabled:text-default-foreground disabled:opacity-90 flex flex-row items-center gap-2",
                        " px-3",
                        compact && "px-4"
                      )}
                      variant={isResteemd ? "flat" : "light"}
                      radius="full"
                      color={isResteemd ? "success" : undefined}
                      isDisabled={true}
                      isLoading={reblogMutation.isPending}
                      size="sm"
                    >
                      {!reblogMutation.isPending && (
                        <SlLoop className="text-lg text-default-900" />
                      )}
                      {!compact && !!comment.resteem_count && (
                        <div className="text-tiny text-default-900">
                          {abbreviateNumber(comment.resteem_count)}
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        {"Confirmation"}
                      </div>
                      <div className="text-tiny flex">
                        {"Resteem this post?"}
                      </div>

                      <div className="text-tiny flex mt-2 space-x-2">
                        <Button
                          onPress={() => setResteemPopup(false)}
                          size="sm"
                          color="default"
                        >
                          No
                        </Button>
                        <Button
                          size="sm"
                          color="secondary"
                          variant="solid"
                          onPress={() => {
                            setResteemPopup(false);
                            if (isResteemd) {
                              toast.success("Already resteem");
                              return;
                            }
                            handleResteem();
                          }}
                        >
                          Yes
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </ButtonWrapper>
            )}
          </div>
        </div>

        {!!comment.payout && (
          <ButtonWrapper
            hoverable
            onPress={() => setBreakdownModal(!breakdownModal)}
            className="pr-2"
            title={`$${comment.payout?.toLocaleString()} Payout`}
          >
            <Popover
              placement="top"
              onOpenChange={setBreakdownModal}
              isOpen={breakdownModal}
            >
              <PopoverTrigger>
                <Button
                  radius="full"
                  isDisabled
                  isIconOnly
                  size="sm"
                  variant="light"
                >
                  <PiCurrencyCircleDollarFill className="text-lg" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <RewardBreakdownCard comment={comment} />
              </PopoverContent>
            </Popover>

            <div className="text-tiny">{comment.payout?.toFixed(2)}</div>
          </ButtonWrapper>
        )}
      </div>

      {voterDisclosure.isOpen && (
        <Modal
          isOpen={voterDisclosure.isOpen}
          onClose={voterDisclosure.onClose}
          placement="top-center"
          hideCloseButton
          scrollBehavior="inside"
          size="lg"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Voters
                </ModalHeader>
                <ModalBody>
                  <VotersCard comment={comment} />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    onPress={onClose}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
});

const ButtonWrapper = (props: WrapperProps) => {
  const {
    children,
    className,
    title,
    onPress,
    hoverable,
    isDisabled,
    as,
    href,
    passHref,
  } = props;
  return (
    <Card
      title={title}
      as={as}
      href={href}
      passHref={passHref}
      isPressable={!isDisabled && !!onPress && !href}
      onPress={(e) => !href && onPress && onPress(e)}
      isDisabled={isDisabled}
      className={twMerge(
        `flex flex-row items-center gap-1 rounded-full dark:bg-foreground/15`,
        hoverable ? "hover:!bg-default/40 hover:!cursor-pointer" : "",
        className
      )}
    >
      {children}
    </Card>
  );
};
