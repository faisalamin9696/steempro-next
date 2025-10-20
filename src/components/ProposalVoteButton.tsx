import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import {
  getProposalVotes,
  ProposalVote,
  removeProposal,
  voteForProposal,
} from "@/libs/steem/condenser";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import ConfirmationPopup from "./ui/ConfirmationPopup";
import { twMerge } from "tailwind-merge";
import { addProposalsHandler } from "@/hooks/redux/reducers/ProposalsReducer";

export default function ProposalVoteButton({
  proposal,
  className,
  getVoteStatus,
}: {
  proposal: Proposal;
  className?: string;
  getVoteStatus?: (isVoted: boolean) => void;
}) {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const { data: session } = useSession();
  const [isVoted, setIsVoted] = useState(false);
  const { mutate } = useSWRConfig();
  const isSelf = proposal?.creator === session?.user?.name;
  const dispatch = useAppDispatch();
  const proposalsData = useAppSelector(state => state.proposalsReducer.values);

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
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (isVoted) setIsVoted(false);
      else setIsVoted(true);
      mutate(`proposals-votes-${proposal.id}`);
      toast.success(isVoted ? "Proposal Unapproved" : "Proposal Approved");
    },
  });


  const removeMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      removeProposal(
        loginInfo,
        proposal.id,
        data.key,
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(addProposalsHandler([...proposalsData?.filter(item => item.id !== Number(proposal.id)), { ...proposal, status: 'removed' }]))
      toast.success(`Proposal #${proposal.id} removed successfully`);
    },
  });

  async function handleVote(isKeychain?: boolean) {
    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    voteMutation.mutate({
      key: credentials?.key ?? "",
      isKeychain: isKeychain || credentials.keychainLogin,
    });
  }


  async function handleRemoveProposal(isKeychain?: boolean) {
    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    removeMutation.mutate({
      key: credentials?.key ?? "",
      isKeychain: isKeychain || credentials.keychainLogin,
    });
  }


  return (

    <div className="flex flex-row">

      {isSelf && <ConfirmationPopup
        triggerProps={{
          size: "sm",
          variant: "flat",
          color: "warning",
          className: 'rounded-s-lg',
          radius: 'none'
        }}
        buttonTitle="Remove" onConfirm={handleRemoveProposal}
        subTitle={
          `Remove proposal #${proposal.id}?`
        }
      />}

      <ConfirmationPopup
        popoverProps={{ placement: "left" }}
        triggerProps={{
          size: "sm",
          color: isVoted ? "danger" : "success",
          radius: "none",
          className: twMerge(className, isSelf && ' rounded-s-none'),
          isDisabled: voteMutation.isPending,
          isLoading: voteMutation.isPending,
          variant: "flat",
        }}
        buttonTitle={isVoted ? "Unvote" : "Vote"}
        subTitle={
          isVoted
            ? `Unvote proposal #${proposal.id}?`
            : `Vote proposal #${proposal.id}?`
        }
        onKeychainPress={() => handleVote(true)}
        onConfirm={handleVote}
      />

    </div>
  );
}
