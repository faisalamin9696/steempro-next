import { useAppSelector } from "@/constants/AppFunctions";
import {
  getProposalVotes,
  ProposalVote,
  voteForProposal,
} from "@/libs/steem/condenser";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import ConfirmationPopup from "./ui/ConfirmationPopup";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "@/utils/i18n";

export default function ProposalVoteButton({
  proposal,
  className,
  getVoteStatus,
}: {
  proposal: Proposal;
  className?: string;
  getVoteStatus?: (isVoted: boolean) => void;
}) {
  const { t } = useTranslation();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const { data: session } = useSession();
  const [isVoted, setIsVoted] = useState(false);
  const { mutate } = useSWRConfig();

  const { data } = useSWR<ProposalVote[]>(
    session?.user?.name
      ? `proposals-vote-check-${proposal.id}-${session.user.name}`
      : null,
    () => getProposalVotes(proposal.id, session?.user?.name ?? "null", 1)
  );

  useMemo(() => {
    if (data) {
      const voted = data.length > 0 && data[0].voter === session?.user?.name;
      setIsVoted(voted);
    }
  }, [data]);

  useEffect(() => {
    getVoteStatus?.(isVoted);
  }, [isVoted]);

  const voteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      voteForProposal(
        loginInfo,
        data.key,
        {
          proposalId: proposal.id,
          approved: !isVoted,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(t('common.error_occurred', { error: error.message || JSON.stringify(error) }));
        return;
      }
      if (isVoted) setIsVoted(false);
      else setIsVoted(true);
      mutate(`proposals-votes-${proposal.id}`);
      toast.success(isVoted ? t("proposals.unapproved") : t("proposals.approved"));
    },
  });

  async function handleVote(isKeychain?: boolean) {
    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }
    if (!credentials?.key) {
      toast.error(t("proposals.invalid_credentials"));
      return;
    }

    voteMutation.mutate({
      key: credentials?.key ?? "",
      isKeychain: isKeychain || credentials.keychainLogin,
    });
  }

  return (
    <ConfirmationPopup
      popoverProps={{ placement: "left" }}
      triggerProps={{
        size: "sm",
        color: isVoted ? "danger" : "success",
        radius: "none",
        className: twMerge(className),
        isDisabled: voteMutation.isPending,
        isLoading: voteMutation.isPending,
        variant: "flat",
      }}
      buttonTitle={isVoted ? t("proposals.unvote") : t("proposals.vote")}
      subTitle={
        isVoted
          ? t("proposals.unvote_confirmation").replace("{{id}}", proposal.id.toString())
          : t("proposals.vote_confirmation").replace("{{id}}", proposal.id.toString())
      }
      onKeychainPress={() => handleVote(true)}
      onConfirm={handleVote}
    />
  );
}
