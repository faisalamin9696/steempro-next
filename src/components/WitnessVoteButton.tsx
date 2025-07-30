import { useAppSelector, useAppDispatch } from "@/constants/AppFunctions";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { voteForWitness } from "@/libs/steem/condenser";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { twMerge } from "tailwind-merge";
import ConfirmationPopup from "./ui/ConfirmationPopup";

export default function WitnessVoteButton({
  isVoted,
  witness,
  isDisabled,
  className,
}: {
  isVoted: boolean;
  witness: string;
  isDisabled: boolean;
  className?: string;
}) {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const { authenticateUserActive, isAuthorizedActive } = useLogin();

  const voteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      voteForWitness(
        loginInfo,
        data.key,
        {
          witness: witness,
          approved: !isVoted,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (isVoted)
        dispatch(
          saveLoginHandler({
            ...loginInfo,
            witness_votes: loginInfo.witness_votes.filter(
              (item) => item !== witness
            ),
          })
        );
      else
        dispatch(
          saveLoginHandler({
            ...loginInfo,
            witness_votes: [...loginInfo.witness_votes, witness],
          })
        );
      toast.success(isVoted ? "Witness Removed" : "Witness Approved");
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

  return (
    <ConfirmationPopup
      popoverProps={{ placement: "left" }}
      triggerProps={{
        size: "sm",
        color: isVoted ? "danger" : "success",
        radius: "none",
        className: twMerge(
          `px-2 sm:px-4`,
          className
        ),
        isDisabled: isDisabled || voteMutation.isPending,
        isLoading: voteMutation.isPending,
        variant: "flat",
      }}
      buttonTitle={isVoted ? "Unvote" : "Vote"}
      subTitle={
        isVoted ? `Unvote withness ${witness}?` : `Vote witness ${witness}?`
      }
      onKeychainPress={() => handleVote(true)}
      onConfirm={handleVote}
    />
  );
}
