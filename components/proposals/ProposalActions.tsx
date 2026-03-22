import { Button } from "@heroui/button";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProposalVoteButton from "./ProposalVoteButton";
import SPopover from "../ui/SPopover";
import { useSession } from "next-auth/react";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { useAccountsContext } from "../auth/AccountsContext";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addProposalsHandler } from "@/hooks/redux/reducers/ProposalsReducer";

import { useTranslations } from "next-intl";

function ProposalActions({
  proposal,
  onView,
}: {
  proposal: Proposal;
  onView: () => void;
}) {
  const t = useTranslations("Proposals");
  const { data: session } = useSession();
  const { authenticateOperation } = useAccountsContext();
  const [isPending, setIsPending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const proposalsData = useAppSelector((s) => s.proposalsReducer.values);
  const dispatch = useAppDispatch();

  const handleRemove = async (proposal: Proposal) => {
    setIsRemoving(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.removeProposal(
        session?.user?.name!,
        [proposal.id],
        key,
        useKeychain
      );
      dispatch(
        addProposalsHandler([
          ...proposalsData?.filter((item) => item.id !== Number(proposal.id)),
          { ...proposal, status: "removed" },
        ])
      );
      toast.success(t("actions.removedSuccess"));
    }).finally(() => {
      setIsRemoving(false);
    });
  };

  const handleVote = async (proposal: Proposal, approve: boolean) => {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.voteProposal(
        session?.user?.name!,
        [proposal.id],
        approve,
        key,
        useKeychain
      );

      dispatch(
        addProposalsHandler([
          ...proposalsData?.filter((item) => item.id !== Number(proposal.id)),
          { ...proposal, observer_vote: approve ? 1 : 0 },
        ])
      );
      toast.success(
        t(approve
          ? "actions.unvotedSuccess"
          : "actions.votedSuccess")
      );
    }).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        className="border-1"
        size="sm"
        isIconOnly
        onPress={onView}
      >
        <Eye size={18} />
      </Button>

      <ProposalVoteButton
        proposal={proposal}
        handleVote={handleVote}
        isPending={isPending}
      />

      {proposal.creator === session?.user?.name && (
        <SPopover
          title={t("actions.removeTitle", { id: proposal.id })}
          description={t("actions.removeDesc")}
          trigger={
            <Button
              isLoading={isRemoving}
              size="sm"
              variant="flat"
              color="danger"
              isIconOnly
            >
              <Trash2 size={18} />
            </Button>
          }
        >
          {(onClose) => (
            <div className="flex flex-row gap-2 self-end">
              <Button onPress={onClose}>{t("actions.cancel")}</Button>
              <Button
                color="danger"
                onPress={() => {
                  onClose();
                  handleRemove(proposal);
                }}
              >
                {t("actions.remove")}
              </Button>
            </div>
          )}
        </SPopover>
      )}
    </div>
  );
}

export default ProposalActions;
