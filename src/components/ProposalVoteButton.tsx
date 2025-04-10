import { useAppSelector } from "@/libs/constants/AppFunctions";
import {
  getProposalVotes,
  ProposalVote,
  voteForProposal,
} from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useSession } from "next-auth/react";
import KeychainButton from "./KeychainButton";
import useSWR, { useSWRConfig } from "swr";

export default function ProposalVoteButton({
  proposal,
}: {
  proposal: Proposal;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();
  const shouldFetch = !!session?.user?.name;
  const [isVoted, setIsVoted] = useState(false);
  const { mutate } = useSWRConfig();

  const { data } = useSWR<ProposalVote[]>(
    shouldFetch ? `proposals-vote-check-${proposal.id}` : null,
    () => getProposalVotes(proposal.id, session?.user?.name ?? "null", 1)
  );

  useMemo(() => {
    if (data) {
      const voted = data.length > 0 && data[0].voter === session?.user?.name;
      setIsVoted(voted);
    }
  }, [data]);

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

  async function handleVote(isKeychain?: boolean) {
    if (!isKeychain) {
      authenticateUser();
      if (!isAuthorized()) return;
    }

    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    voteMutation.mutate({
      key: credentials?.key ?? "",
      isKeychain: isKeychain || credentials.keychainLogin,
    });
  }

  if (!data) return null;
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement={"left"}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant={isVoted ? "flat" : "solid"}
          isDisabled={voteMutation.isPending}
          isLoading={voteMutation.isPending}
          color={isVoted ? "success" : "default"}
          radius="sm"
          size="sm"
        >
          {isVoted ? (
            <BiSolidUpvote className="text-xl" />
          ) : (
            <BiUpvote className="text-xl" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">{"Confirmation"}</div>
          <div className="text-tiny flex">
            {isVoted
              ? `Remove vote for proposal #${proposal.id}?`
              : `Approve proposal #${proposal.id}?`}
          </div>

          <div className=" flex flex-col items-start gap-2">
            <div className="text-tiny flex mt-2 space-x-2">
              <Button
                onPress={() => setIsOpen(false)}
                size="sm"
                color="default"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color={isVoted ? "danger" : "success"}
                variant="solid"
                onPress={() => {
                  setIsOpen(false);
                  handleVote();
                }}
              >
                {isVoted ? "Remove" : "Approve"}
              </Button>
            </div>

            <KeychainButton
              onPress={() => {
                setIsOpen(false);
                handleVote(true);
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
