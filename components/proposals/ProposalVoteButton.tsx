import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import SPopover from "../ui/SPopover";
import { Button } from "@heroui/button";
import { Vote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProposalVoteButton({
  proposal,
  handleVote,
  isPending,
}: {
  proposal: Proposal;
  handleVote: (proposal: Proposal, approve: boolean) => void;
  isPending: boolean;
}) {
  const t = useTranslations("Proposals");
  const { data: session } = useSession();
  const [isVoted, setIsVoted] = useState(false);

  const { data } = useSWR<ProposalVote[]>(
    session?.user?.name
      ? `proposals-vote-check-${proposal.id}-${session.user.name}`
      : null,
    () => sdsApi.getProposalVotes(proposal.id, session?.user?.name!, 1)
  );

  useMemo(() => {
    if (data) {
      const voted = data.length > 0 && data[0].voter === session?.user?.name;
      setIsVoted(voted);
    }
  }, [data]);

  return (
    <SPopover
      title={t(isVoted ? "actions.unvoteTitle" : "actions.voteTitle", { id: proposal.id })}
      description={t(isVoted ? "actions.unvoteDesc" : "actions.voteDesc")}
      trigger={
        <Button
          variant="flat"
          size="sm"
          color={isVoted ? "danger" : "primary"}
          startContent={!isPending && <Vote size={18} />}
          isLoading={isPending}
        >
          {t(isVoted ? "actions.unvote" : "actions.vote")}
        </Button>
      }
    >
      {(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button variant="flat" onPress={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button
            color={isVoted ? "danger" : "primary"}
            onPress={() => {
              onClose();
              handleVote(proposal, !isVoted);
            }}
          >
            {t(isVoted ? "actions.unvote" : "actions.vote")}
          </Button>
        </div>
      )}
    </SPopover>
  );
}
