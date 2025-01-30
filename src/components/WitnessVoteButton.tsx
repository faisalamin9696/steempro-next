import { useAppSelector, useAppDispatch } from "@/libs/constants/AppFunctions";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { voteForWitness } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useSession } from "next-auth/react";
import KeychainButton from "./KeychainButton";

export default function WitnessVoteButton({ witness }: { witness: Witness }) {
  const [isOpen, setIsOpen] = useState(false);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();

  const isVoted = loginInfo?.witness_votes?.includes(witness.name);

  const voteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      voteForWitness(
        loginInfo,
        data.key,
        {
          witness: witness.name,
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
              (item) => item !== witness.name
            ),
          })
        );
      else
        dispatch(
          saveLoginHandler({
            ...loginInfo,
            witness_votes: [...loginInfo.witness_votes, witness.name],
          })
        );
      toast.success(isVoted ? "Witness Removed" : "Witness Approved");
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
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement={"left"}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="flat"
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
              ? `Remove withness ${witness.name}?`
              : `Approve witness ${witness.name}?`}
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
