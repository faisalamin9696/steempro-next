import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import SModal from "../ui/SModal";
import { Alert, Button, Checkbox, Input } from "@heroui/react";
import SInput from "../ui/SInput";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { normalizeUsername } from "@/utils/editor";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useAccountsContext } from "../auth/AccountsContext";

interface DelegationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  outgoingDelegations: Delegation[];
  initialData?: { delegatee: string; amount: string };
}
export const DelegationModal = ({
  isOpen,
  onOpenChange,
  outgoingDelegations,
  initialData,
}: DelegationModalProps) => {
  const { vestsToSteem, steemToVests } = useSteemUtils();
  const lognData = useAppSelector((s) => s.loginReducer.value);
  let [delegatee, setDelegatee] = useState(initialData?.delegatee || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [existingDelegation, setExistingDelegation] =
    useState<Delegation | null>(null);
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const { authenticateOperation } = useAccountsContext();

  useEffect(() => {
    if (isOpen && initialData) {
      setDelegatee(initialData.delegatee);
      setAmount(initialData.amount);
    } else if (!isOpen) {
      // Reset when closed to avoid stale data if opening for a new delegation
      setDelegatee("");
      setAmount("");
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!delegatee) {
      setExistingDelegation(null);
      return;
    }

    const cleanUsername = delegatee.replace("@", "").toLowerCase().trim();
    const existing = outgoingDelegations?.find(
      (d) => d.to.toLowerCase() === cleanUsername
    );
    setExistingDelegation(existing || null);
  }, [delegatee, outgoingDelegations]);

  const existingAmount = existingDelegation
    ? vestsToSteem(existingDelegation.vests)
    : 0;

  const availableSp = vestsToSteem(
    lognData.vests_own -
      lognData.vests_out -
      lognData.powerdown +
      lognData.powerdown_done +
      existingAmount
  );

  const handleDelegate = async () => {
    delegatee = normalizeUsername(delegatee);
    const isRemoved = Number(amount) === 0;
    setIsPending(true);

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.delegate(
        session?.user?.name!,
        delegatee,
        steemToVests(amount),
        key,
        useKeychain
      );

      dispatch(
        addLoginHandler({
          ...lognData,
          vests_out: existingDelegation
            ? lognData.vests_out - existingAmount + steemToVests(amount)
            : lognData.vests_out + steemToVests(amount),
        })
      );

      if (isRemoved) {
        toast.success("Delegation Removed", {
          description: `${amount} STEEM delegation cancelled. Funds will be available in 5 days.`,
        });
      } else
        toast.success("Delegation Successful", {
          description: `Successfully delegated ${amount} STEEM POWER`,
        });
      setAmount("");
      setDelegatee("");
      setConfirm(false);
      onOpenChange(false);
    }).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={() => (
        <div className="flex flex-row gap-2 items-center">
          <Users size={20} />
          <p>Delegate STEEM Power</p>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col gap-4">
          <Alert
            title="Important Information"
            variant="faded"
            color="primary"
            classNames={{ title: "font-semibold pb-2" }}
            className="border-primary/30 bg-primary/5"
            description="Delegated SP can be undelegated at any time, but there's a 5-day
              cooldown before it returns to your account."
          />

          <SInput
            id="delegatee"
            placeholder="Username"
            value={delegatee}
            onChange={(e) => setDelegatee(e.target.value)}
            label="Delegate to"
            labelPlacement="outside-top"
            isDisabled={isPending}
          />

          {existingDelegation && (
            <Alert
              title="Existing Delegation Found"
              variant="faded"
              color="danger"
              classNames={{ title: "font-semibold pb-2" }}
              description={
                <>
                  <p>
                    You already have an active delegation to{" "}
                    <span className="font-mono font-bold">
                      @{existingDelegation.to}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold">
                      {existingAmount.toLocaleString()} SP
                    </span>
                    .
                  </p>
                  <p className="text-muted">
                    Setting a new amount will{" "}
                    <span className="font-semibold text-yellow-500">
                      override
                    </span>{" "}
                    the current delegation. To remove the delegation entirely,
                    set the amount to 0.
                  </p>
                </>
              }
            />
          )}

          <Input
            id="amount"
            type="number"
            placeholder="0.000"
            value={amount}
            onValueChange={setAmount}
            label="Amount (STEEM)"
            labelPlacement="outside-top"
            isDisabled={isPending}
            min={0}
            step={0.001}
            description={
              <button
                disabled={isPending}
                onClick={() =>
                  setAmount((availableSp + existingAmount).toFixed(3))
                }
                className="text-xs text-muted hover:underline underline-offset-4 cursor-pointer"
              >
                Available: {availableSp.toLocaleString()}{" "}
                {!!existingAmount && `+ ${existingAmount.toLocaleString()}`} SP
              </button>
            }
          />

          <div className="flex gap-2 pt-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="bordered"
                size="sm"
                className="flex-1"
                isDisabled={isPending}
                onPress={() =>
                  setAmount(((availableSp * percent) / 100).toFixed(3))
                }
              >
                {percent}%
              </Button>
            ))}
          </div>

          {existingDelegation && amount && (
            <Alert
              variant="faded"
              color={
                parseFloat(amount) > existingAmount ? "success" : "warning"
              }
              description={
                <div className="text-sm">
                  <p className="text-muted">
                    {parseFloat(amount) === 0 ? (
                      <span>
                        This will{" "}
                        <span className="text-warning font-semibold">
                          remove
                        </span>{" "}
                        your delegation to @{existingDelegation.to}
                      </span>
                    ) : parseFloat(amount) > existingAmount ? (
                      <span>
                        This will{" "}
                        <span className="text-green-500 font-semibold">
                          increase
                        </span>{" "}
                        your delegation by{" "}
                        {(parseFloat(amount) - existingAmount).toLocaleString()}{" "}
                        SP
                      </span>
                    ) : (
                      <span>
                        This will{" "}
                        <span className="text-warning font-semibold">
                          decrease
                        </span>{" "}
                        your delegation by{" "}
                        {(existingAmount - parseFloat(amount)).toLocaleString()}{" "}
                        SP
                      </span>
                    )}
                  </p>
                </div>
              }
            />
          )}

          <Checkbox
            isSelected={confirm}
            onValueChange={setConfirm}
            isDisabled={isPending}
          >
            Confirm Delegation
          </Checkbox>
          <Button
            onPress={handleDelegate}
            isDisabled={!confirm || !delegatee || !amount}
            isLoading={isPending}
          >
            {parseFloat(amount) === 0
              ? "Remove Delegation"
              : existingDelegation
              ? "Update Delegation"
              : "Delegate"}
          </Button>
        </div>
      )}
    </SModal>
  );
};
