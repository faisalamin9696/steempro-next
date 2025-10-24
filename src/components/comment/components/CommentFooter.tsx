import { useDisclosure } from "@heroui/modal";
import { Button, ButtonGroup, PressEvent } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import React, { memo, useEffect, useState } from "react";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { useMutation } from "@tanstack/react-query";
import {
  calculatePowerUsage,
  getCredentials,
  getSessionKey,
  getSettings,
  updateSettings,
} from "@/utils/user";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { useLogin } from "@/components/auth/AuthProvider";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { toast } from "sonner";
import { reblogPost, voteComment } from "@/libs/steem/condenser";
import { getVoteData } from "@/libs/steem/sds";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import VotingSliderCard from "@/components/VotingSliderCard";
import { CommentProps } from "../CommentCard";
import {
  BiDotsHorizontalRounded,
  BiDownvote,
  BiSolidDownvote,
  BiSolidUpvote,
  BiUpvote,
} from "react-icons/bi";
import { abbreviateNumber } from "@/utils/helper";
import { FaRegComment } from "react-icons/fa";

import { RewardBreakdownCard } from "@/components/RewardBreakdownCard";
import { twMerge } from "tailwind-merge";
import VotersCard from "@/components/VotersCard";
import "./style.scss";
import ClickAwayListener from "react-click-away-listener";
import { useSession } from "next-auth/react";
import { As } from "@heroui/system";
import SLink from "@/components/ui/SLink";
import { AsyncUtils } from "@/utils/async.utils";
import { SiSteem } from "react-icons/si";
import { mutate } from "swr";
import SModal from "@/components/ui/SModal";
import { AiOutlineRetweet } from "react-icons/ai";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { Tooltip } from "@heroui/tooltip";
import { RiHeartAdd2Fill, RiHeartAdd2Line } from "react-icons/ri";
import { Spinner } from "@heroui/spinner";
import CommentHeaderMenu from "./CommentHeaderMenu";

export default memo(function CommentFooter(props: CommentProps) {
  const { comment, className, isReply, compact, isDetails, stickLeft } = props;

  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const voterDisclosure = useDisclosure();
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();

  const dispatch = useAppDispatch();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  let settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();

  const isUpvoted =
    !!comment.observer_vote && comment.observer_vote_percent > 0;

  const isDownvoted =
    !!comment.observer_vote && comment.observer_vote_percent < 0;
  const isResteemd = !!comment.observer_resteem;
  const isVoting =
    comment.status === "upvoting" || comment.status === "downvoting";
  const [upvotePopup, setUpvotePopup] = useState(false);
  const [downvotePopup, setDownvotePopup] = useState(false);
  const [longPressUpvote, setLongPressUpvote] = useState<
    PressEvent | undefined
  >();
  const [longPressDownvote, setLongPressDownvote] = useState<
    PressEvent | undefined
  >();

  function closeVotingModal() {
    if (upvotePopup) setUpvotePopup(false);
    if (downvotePopup) setDownvotePopup(false);
  }

  const voteMutation = useMutation({
    mutationFn: ({
      key,
      weight,
      isKeychain,
      isLongPress,
    }: {
      key: string;
      weight: number;
      isKeychain?: boolean;
      isLongPress?: boolean;
    }) => voteComment(loginInfo, comment, key, weight, isKeychain),
    onSettled(data, error, variables, context) {
      const { weight, isLongPress } = variables;
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        dispatch(addCommentHandler({ ...comment, status: "idle" }));
        return;
      }

      const isDownvote = weight < 0;
      const vData = getVoteData(loginInfo, globalData);
      const isRemove = weight === 0;

      const vote_value =
        (weight / 100) *
        (vData.current_vote *
          (isDownvote
            ? loginInfo.downvote_mana_percent
            : loginInfo.upvote_mana_percent) *
          0.01);

      const newChanges: Post | Feed = {
        ...comment,
        observer_vote: isRemove ? 0 : 1,
        [isDownvote ? "downvote_count" : "upvote_count"]: isDownvote
          ? comment.downvote_count + (isRemove ? -1 : +1)
          : comment.upvote_count + +(isRemove ? -1 : +1),
        observer_vote_percent: weight,
        payout: isRemove
          ? comment.payout
          : comment.payout + (isDownvote ? -vote_value : vote_value),
        observer_vote_rshares: isRemove ? 0 : comment.observer_vote_rshares,
        status: "idle",
      };

      mutate(
        [`post-${comment.author}-${comment.permlink}`, session?.user?.name],
        (prev) => [
          newChanges,
          prev?.[1] ?? null, // fallback to null if no metadata
        ],
        {
          optimisticData: (current) => [
            {
              ...current?.[0], // safe access to current data
              ...newChanges, // merge new changes
            },
            current?.[1] ?? null,
          ],
          revalidate: false,
          rollbackOnError: true, // optional: revert on failure
        }
      );

      dispatch(addCommentHandler(newChanges));

      // update the login user data
      const downvote_per = isDownvote
        ? loginInfo.downvote_mana_percent - calculatePowerUsage(weight)
        : loginInfo.downvote_mana_percent;
      const upvote_per = !isDownvote
        ? loginInfo.upvote_mana_percent - calculatePowerUsage(weight)
        : loginInfo.upvote_mana_percent;
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          upvote_mana_percent: upvote_per,
          downvote_mana_percent: downvote_per,
        })
      );
      if (!isRemove) {
        settings = getSettings();
        if (settings.voteOptions.remember) {
          const voteToSave = isDownvote ? -weight : weight;
          const newSettings = {
            ...settings,
            voteOptions: {
              ...settings.voteOptions,
              value: isLongPress ? settings.voteOptions.value : voteToSave,
            },
          };
          updateSettings(newSettings);
          dispatch(updateSettingsHandler(newSettings));
        }
      }

      if (variables.weight < 0) {
        return;
      }
    },
  });

  async function castVote(
    weight: number,
    downvote?: boolean,
    isLongPress?: boolean
  ) {
    closeVotingModal();

    authenticateUser();
    if (!isAuthorized()) return;

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
        isLongPress,
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
      mutate(
        [`post-${comment.author}-${comment.permlink}`, session?.user?.name],
        (prev) => [
          { ...prev?.[0], observer_resteem: 1 },
          prev?.[1] ?? null, // fallback to null if no metadata
        ],
        {
          optimisticData: (current) => [
            {
              ...current?.[0], // safe access to current data
              observer_resteem: 1, // merge new changes
            },
            current?.[1] ?? null,
          ],
          revalidate: false,
          rollbackOnError: true, // optional: revert on failure
        }
      );
      dispatch(addCommentHandler({ ...comment, observer_resteem: 1 }));
      toast.success("Resteemed");
    },
  });

  const handleVibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200); // Vibrate for 200ms
    } else {
      console.warn("Vibration API not supported");
    }
  };

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

  // handleLongPress upvote
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (settings.longPressVote.enabled) {
      const fetchedUser = settings.longPressVote.usersList.filter(
        (user) => user.name === comment.author
      )[0];
      const voteWeight =
        fetchedUser?.weight ?? settings.voteOptions.value ?? 100;
      timer = longPressUpvote
        ? setTimeout(() => {
          handleVibrate();
          castVote(voteWeight, false, true);
        }, 800)
        : undefined;
    }
    return () => clearTimeout(timer);
  }, [longPressUpvote]);

  // handleLongPress downvote
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (settings.longPressVote.enabled) {
      const fetchedUser = settings.longPressVote.usersList.filter(
        (user) => user.name === comment.author
      )[0];
      const voteWeight =
        fetchedUser?.weight ?? settings.voteOptions.value ?? 100;
      timer = longPressDownvote
        ? setTimeout(() => {
          handleVibrate();
          castVote(voteWeight, true, true);
        }, 800)
        : undefined;
    }
    return () => clearTimeout(timer);
  }, [longPressDownvote]);

  const stickyLeftFooter = (
    <div className="flex flex-col items-center gap-12">
      {(upvotePopup || downvotePopup) && (
        <ClickAwayListener
          onClickAway={closeVotingModal}
          mouseEvent="mousedown"
        >
          <div className="absolute animate-appearance-in z-[11] top-[40px] left-24">
            <VotingSliderCard
              {...props}
              downvote={downvotePopup}
              onConfirm={castVote}
              onClose={closeVotingModal}
            />
          </div>
        </ClickAwayListener>
      )}

      <Tooltip
        isDisabled={isVoting}
        placement="right"
        content={
          <div className="flex flex-row gap-4 items-center ">
            <Button
              radius="full"
              variant="light"
              onPress={() => {
                authenticateUser();
                if (!isAuthorized()) {
                  return;
                }
                setUpvotePopup(!upvotePopup);
              }}
              onPressStart={setLongPressUpvote}
              onPressEnd={() => setLongPressUpvote(undefined)}
              isDisabled={isVoting}
              isLoading={comment.status === "upvoting"}
              isIconOnly
              size="md"
              className={twMerge(
                isUpvoted ? "text-success-400" : "text-inherit"
              )}
            >
              {isUpvoted ? <BiSolidUpvote size={24} /> : <BiUpvote size={24} />}
            </Button>

            <Button
              isIconOnly
              size="md"
              variant="light"
              isDisabled={isVoting}
              onPressStart={setLongPressDownvote}
              onPressEnd={() => setLongPressDownvote(undefined)}
              isLoading={comment.status === "downvoting"}
              onPress={() => {
                if (!isAuthorized()) {
                  authenticateUser();
                  return false;
                }
                setDownvotePopup(!downvotePopup);
              }}
              className={twMerge(
                isDownvoted ? "text-danger-400" : "text-inherit"
              )}
              radius="full"
            >
              {isDownvoted ? (
                <BiSolidDownvote size={24} />
              ) : (
                <BiDownvote size={24} />
              )}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          {isVoting ? (
            <Spinner size="sm" />
          ) : !!comment.observer_vote ? (
            <RiHeartAdd2Fill
              className={
                isUpvoted
                  ? "text-success-400"
                  : isDownvoted
                    ? "text-danger-400"
                    : ""
              }
              size={24}
            />
          ) : (
            <RiHeartAdd2Line size={24} />
          )}

          {!!(comment.upvote_count + comment.downvote_count) && (
            <button
              onClick={voterDisclosure.onOpen}
              disabled={isVoting}
              className={twMerge(
                "text-sm uppercase h-8 text-center",
                "hover:text-opacity-hover disabled:text-opacity-disabled"
              )}
            >
              {abbreviateNumber(comment.upvote_count + comment.downvote_count)}
            </button>
          )}
        </div>
      </Tooltip>

      <div className="flex flex-col items-center">
        <Tooltip content="Jump to Comments" placement="bottom" closeDelay={250}>
          {!isReply && !compact && (
            <Button
              disableRipple
              className=" hover:!bg-transparent text-inherit min-h-12 min-w-0"
              variant="light"
              radius="none"
              size="sm"
              onPress={() =>
                document
                  .getElementById(`comments`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              title={`${comment.children} Comments`}
            >
              <div className="flex flex-col gap-2 items-center">
                <FaRegComment size={24} className="" />

                {!!comment.children && (
                  <div className="text-sm">
                    {abbreviateNumber(comment.children)}
                  </div>
                )}
              </div>
            </Button>
          )}
        </Tooltip>
      </div>
      {!isReply && (
        <Tooltip content="Resteem" placement="bottom" closeDelay={250}>
          <div>
            <ConfirmationPopup
              popoverProps={{ placement: "right" }}
              triggerProps={{
                isDisabled: reblogMutation.isPending,
                variant: "light",
                radius: "none",
                color: isResteemd ? "success" : undefined,
                isLoading: reblogMutation.isPending,
                size: "sm",
                isIconOnly: !comment.resteem_count ? true : false,
                className: twMerge(
                  "hover:!bg-transparent min-h-12 min-w-0",
                  !comment.resteem_count ? "w-12" : ""
                ),
                disableRipple: true,
              }}
              subTitle="Resteem this post?"
              buttonTitle={
                <div className="flex flex-col items-center gap-2">
                  {!reblogMutation.isPending && (
                    <AiOutlineRetweet size={24} />
                  )}
                  {!!comment.resteem_count && (
                    <div className="text-sm">
                      {abbreviateNumber(comment.resteem_count)}
                    </div>
                  )}
                </div>
              }
              onConfirm={() => {
                if (isResteemd) {
                  toast.success("Already resteem");
                  return;
                }
                handleResteem();
              }}
            />
          </div>
        </Tooltip>
      )}

      {!isReply && (
        <Tooltip content="Payout" placement="bottom" closeDelay={250}>
          <div>
            <Popover placement="right" size="md" className=" w-64">
              <PopoverTrigger>
                <Button
                  disableRipple
                  radius="none"
                  size="sm"
                  variant="light"
                  className="px-1 pr-2 h-14 hover:bg-transparent text-inherit "
                // title={`${
                //   !comment.max_accepted_payout
                //     ? "Declined"
                //     : "$" + comment.payout?.toLocaleString()
                // }  Payout`}
                >
                  <div className="flex flex-col items-center gap-3">
                    {(comment.payout && !comment.percent_steem_dollars) ||
                      !comment.max_accepted_payout ? (
                      <SiSteem size={20} />
                    ) : (
                      <PiCurrencyCircleDollarFill size={24} />
                    )}

                    <div
                      className={twMerge(
                        "text-sm",
                        !comment.max_accepted_payout &&
                        "line-through opacity-disabled"
                      )}
                    >
                      {comment.payout?.toFixed(2)}
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <RewardBreakdownCard comment={comment} />
              </PopoverContent>
            </Popover>
          </div>
        </Tooltip>
      )}

      <CommentHeaderMenu
        placement="right"
        iconSize={24}
        comment={comment}
        handleEdit={props.handleEdit}
      />
    </div>
  );

  return (
    <div className={twMerge("flex flex-col p-1 gap-1 w-full ", className)}>
      {stickLeft && !isReply && isDetails ? (
        stickyLeftFooter
      ) : (
        <div
          className={twMerge(
            "flex flex-wrap items-center max-xs:items-start gap-2",
            !isReply && "justify-between"
          )}
        >
          <div className={twMerge("flex", compact ? "gap-3" : "gap-4")}>
            <div className="flex flex-wrap items-center gap-2 relative  ">
              {(upvotePopup || downvotePopup) && (
                <ClickAwayListener
                  onClickAway={closeVotingModal}
                  mouseEvent="mousedown"
                >
                  <div className="absolute animate-appearance-in z-[11] top-[-50px]">
                    <VotingSliderCard
                      {...props}
                      downvote={downvotePopup}
                      onConfirm={castVote}
                      onClose={closeVotingModal}
                    />
                  </div>
                </ClickAwayListener>
              )}

              <ButtonGroup className="gap-0" size="sm" radius="full" isIconOnly>
                <Button
                  radius="full"
                  title="Upvote"
                  variant="solid"
                  onPress={() => {
                    authenticateUser();
                    if (!isAuthorized()) {
                      return;
                    }
                    setUpvotePopup(!upvotePopup);
                  }}
                  onPressStart={setLongPressUpvote}
                  onPressEnd={() => setLongPressUpvote(undefined)}
                  isDisabled={isVoting}
                  isLoading={comment.status === "upvoting"}
                  isIconOnly
                  size="sm"
                  className={twMerge(
                    "bg-foreground/10",
                    isUpvoted ? "text-success-400" : "text-default-700"
                  )}
                >
                  {isUpvoted ? (
                    <BiSolidUpvote size={18} />
                  ) : (
                    <BiUpvote size={18} />
                  )}
                </Button>

                {!!(comment.upvote_count + comment.downvote_count) && (
                  <button
                    title={`${comment.upvote_count} Votes`}
                    onClick={voterDisclosure.onOpen}
                    disabled={isVoting}
                    className={twMerge(
                      "text-sm bg-foreground/10 disabled:bg-foreground/5 uppercase text-default-700 h-8 text-center",
                      "hover:text-opacity-hover disabled:text-opacity-disabled"
                    )}
                  >
                    {abbreviateNumber(comment.upvote_count + comment.downvote_count)}
                  </button>
                )}

                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  title="Downvote"
                  isDisabled={isVoting}
                  onPressStart={setLongPressDownvote}
                  onPressEnd={() => setLongPressDownvote(undefined)}
                  isLoading={comment.status === "downvoting"}
                  onPress={() => {
                    if (!isAuthorized()) {
                      authenticateUser();
                      return false;
                    }
                    setDownvotePopup(!downvotePopup);
                  }}
                  className={twMerge(
                    "bg-foreground/10",
                    isDownvoted ? "text-danger-400" : "text-default-700"
                  )}
                  radius="full"
                >
                  {isDownvoted ? (
                    <BiSolidDownvote size={18} />
                  ) : (
                    <BiDownvote size={18} />
                  )}
                </Button>
              </ButtonGroup>

              {!isReply && !compact && (
                <Button
                  onPress={() =>
                    isDetails &&
                    document
                      .getElementById(`comments`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  title={`${comment.children} Comments`}
                  radius="full"
                  size="sm"
                  variant="solid"
                  href={
                    isDetails
                      ? undefined
                      : `/${comment.category}/@${comment.author}/${comment.permlink}#comments`
                  }
                  as={isDetails ? undefined : SLink}
                  passHref={!isDetails}
                  isIconOnly={!comment.children ? true : false}
                  className={twMerge(
                    "bg-foreground/10",
                    !comment.children ? "w-12" : ""
                  )}
                >
                  <div className="flex flex-row gap-2 items-center text-default-700">
                    <FaRegComment size={18} />

                    {!!comment.children && (
                      <div className="text-sm">
                        {abbreviateNumber(comment.children)}
                      </div>
                    )}
                  </div>
                </Button>
              )}

              {!isReply &&
                <ConfirmationPopup
                  triggerProps={{
                    title: `${comment.resteem_count} Resteems`,
                    isDisabled: reblogMutation.isPending,
                    variant: isResteemd ? "flat" : "solid",
                    radius: "full",
                    color: isResteemd ? "success" : undefined,
                    isLoading: reblogMutation.isPending,
                    size: "sm",
                    isIconOnly: !comment.resteem_count ? true : false,
                    className: twMerge(
                      !isResteemd && "bg-foreground/10",
                      !comment.resteem_count ? "w-12" : ""
                    ),
                  }}
                  subTitle="Resteem this post?"
                  buttonTitle={
                    <div className="flex flex-row items-center gap-2 text-default-700">
                      {!reblogMutation.isPending && (
                        <AiOutlineRetweet className="text-lg" />
                      )}
                      {!!comment.resteem_count && (
                        <div className="text-sm">
                          {abbreviateNumber(comment.resteem_count)}
                        </div>
                      )}
                    </div>
                  }
                  onConfirm={() => {
                    if (isResteemd) {
                      toast.success("Already resteem");
                      return;
                    }
                    handleResteem();
                  }}
                />
              }
            </div>
          </div>

          <Popover placement="top" size="md" className=" w-64">
            <PopoverTrigger>
              <Button
                radius="full"
                size="sm"
                className="px-1 pr-2 bg-foreground/10"
                title={`${!comment.max_accepted_payout
                  ? "Declined"
                  : "$" + comment.payout?.toLocaleString()
                  }  Payout`}
              >
                <div className="flex flex-row items-center gap-3 text-default-700">
                  {(comment.payout && !comment.percent_steem_dollars) ||
                    !comment.max_accepted_payout ? (
                    <SiSteem size={20} />
                  ) : (
                    <PiCurrencyCircleDollarFill size={24} />
                  )}

                  <div
                    className={twMerge(
                      "text-sm",
                      !comment.max_accepted_payout &&
                      "line-through opacity-disabled"
                    )}
                  >
                    {comment.payout?.toFixed(2)}
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <RewardBreakdownCard comment={comment} />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <SModal
        bodyClassName="mt-0 p-0"
        isOpen={voterDisclosure.isOpen}
        onOpenChange={voterDisclosure.onOpenChange}
        modalProps={{
          scrollBehavior: "inside",
          hideCloseButton: true,
          size: "lg",
        }}
        body={() => (
          <VotersCard comment={comment} isOpen={voterDisclosure.isOpen} />
        )}
        footer={(onClose) => (
          <Button color="danger" variant="flat" onPress={onClose}>
            Close
          </Button>
        )}
      />
    </div>
  );
});
