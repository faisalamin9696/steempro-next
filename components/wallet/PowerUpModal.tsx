import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import { Alert, Button, Card, Checkbox, Input } from "@heroui/react";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import SInput from "../ui/SInput";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { normalizeUsername } from "@/utils/editor";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useAccountsContext } from "../auth/AccountsContext";

interface PowerUpModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialRecipient?: string;
}

export const PowerUpModal = ({
  isOpen,
  onOpenChange,
  initialRecipient,
}: PowerUpModalProps) => {
  const { steemToVests } = useSteemUtils();
  const [amount, setAmount] = useState("");
  const { data: session } = useSession();
  let [recipient, setRecipient] = useState(
    initialRecipient ?? session?.user?.name ?? ""
  );
  const [isPending, setIsPending] = useState(false);
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((state) => state.loginReducer.value);
  const [confirm, setConfirm] = useState(false);
  const isSelf = session?.user?.name === normalizeUsername(recipient);
  const availableBalance = loginData.balance_steem;
  const { authenticateOperation } = useAccountsContext();

  useEffect(() => {
    if (isOpen) {
      setRecipient(initialRecipient ?? session?.user?.name ?? "");
    }
  }, [isOpen, initialRecipient, session?.user?.name]);

  const handlePowerUp = async () => {
    recipient = normalizeUsername(recipient);
    setIsPending(true);

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.powerUp(
        session?.user?.name!,
        recipient,
        Number(amount),
        key,
        useKeychain
      );

      dispatch(
        addLoginHandler({
          ...loginData,
          balance_steem: loginData.balance_steem - Number(amount),
          vests_own: isSelf
            ? loginData.vests_own + steemToVests(amount)
            : loginData.vests_own,
        })
      );

      toast.success("Power Up Initiated", {
        description: `Powering up ${amount} STEEM to @${recipient}`,
      });
      setAmount("");
      setRecipient(loginData.name);
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
          <Zap size={20} className="text-secondary" />
          <p>Power Up STEEM</p>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col gap-4">
          <Card
            fullWidth
            isPressable
            shadow="none"
            isDisabled={isPending}
            className="p-4 rounded-lg bg-secondary/10 border border-secondary-200"
            onPress={() => setAmount(availableBalance.toFixed(3))}
          >
            <p className="text-sm text-muted mb-1">Available Balance</p>
            <p className="text-2xl font-bold">
              {availableBalance.toLocaleString()}
            </p>
          </Card>

          <SInput
            id="powerup-to"
            placeholder="Username"
            value={recipient}
            label="To"
            labelPlacement="outside-top"
            onChange={(e) => setRecipient(e.target.value)}
            autoCapitalize="none"
            isDisabled={isPending}
          />

          <Input
            id="powerup-amount"
            type="number"
            step="0.001"
            placeholder="0.000"
            value={amount}
            label="Amount (STEEM)"
            labelPlacement="outside-top"
            onChange={(e) => setAmount(e.target.value)}
            isDisabled={isPending}
            min={0.001}
          />

          <Alert
            variant="faded"
            color="primary"
            description={
              <p>
                Power Up converts liquid STEEM to Steem Power, which gives you
                more influence on the platform.
              </p>
            }
          />

          <Checkbox
            isSelected={confirm}
            onValueChange={setConfirm}
            isDisabled={isPending}
          >
            Confirm Power Up
          </Checkbox>
          <Button
            onPress={handlePowerUp}
            className="w-full"
            color="secondary"
            variant="flat"
            isLoading={isPending}
            isDisabled={
              !confirm || !recipient || !amount || parseFloat(amount) <= 0
            }
          >
            Power Up
          </Button>
        </div>
      )}
    </SModal>
  );
};
