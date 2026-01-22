import { useState, useEffect } from "react";
import { ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import SInput from "../ui/SInput";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { normalizeUsername } from "@/utils/editor";
import { useAccountsContext } from "../auth/AccountsContext";
import { Card } from "@heroui/card";

interface WithdrawSavingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialCurrency?: "STEEM" | "SBD";
}

type Currencies = "STEEM" | "SBD";

export const WithdrawSavingsModal = ({
  isOpen,
  onOpenChange,
  initialCurrency = "STEEM",
}: WithdrawSavingsModalProps) => {
  const { data: session } = useSession();
  const lognData = useAppSelector((s) => s.loginReducer.value);
  const [recipient, setRecipient] = useState(session?.user?.name || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currencies>(initialCurrency);
  const [memo, setMemo] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { authenticateOperation } = useAccountsContext();

  useEffect(() => {
    if (isOpen) {
      setRecipient(session?.user?.name || "");
      setCurrency(initialCurrency);
    }
  }, [isOpen, initialCurrency, session?.user?.name]);

  const dispatch = useAppDispatch();
  const availableBalance =
    currency === "STEEM" ? lognData.savings_steem : lognData.savings_sbd;

  const handleWithdraw = async () => {
    const from = session?.user?.name!;
    const to = normalizeUsername(recipient);

    setIsPending(true);

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.withdrawFromSavings(
        from,
        to,
        `${parseFloat(amount).toFixed(3)} ${currency}`,
        memo,
        key,
        useKeychain,
      );

      // Update account state locally
      const updatedAccount = {
        ...lognData,
        savings_steem:
          currency === "STEEM"
            ? lognData.savings_steem - Number(amount)
            : lognData.savings_steem,
        savings_sbd:
          currency === "SBD"
            ? lognData.savings_sbd - Number(amount)
            : lognData.savings_sbd,
      };

      dispatch(addLoginHandler(updatedAccount));

      toast.success("Withdraw Initiated", {
        description: `Withdrawing ${amount} ${currency} from savings to @${to}`,
      });
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
          <ArrowDownLeft size={20} className="text-danger" />
          <p>Withdraw from Savings</p>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col gap-4">
          <Card
            fullWidth
            isPressable
            shadow="none"
            className="p-4 rounded-lg bg-primary/10 border border-primary-200"
            onPress={() => {
              setAmount(availableBalance.toFixed(3));
              if (currency === "SBD") setAmount(availableBalance.toFixed(3));
            }}
          >
            <p className="text-sm text-muted mb-1">Savings Balance</p>
            <p className="text-2xl font-bold">
              {availableBalance.toLocaleString()} {currency}
            </p>
          </Card>

          <Input
            id="from"
            value={`${session?.user?.name}`}
            isDisabled
            label="From"
            labelPlacement="outside-top"
          />

          <SInput
            id="recipient"
            placeholder="Username"
            value={recipient}
            onValueChange={setRecipient}
            label="To"
            labelPlacement="outside-top"
            isRequired
            autoCapitalize="off"
            isDisabled={isPending}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.000"
              value={amount}
              onValueChange={setAmount}
              label="Amount"
              labelPlacement="outside-top"
              isDisabled={isPending}
            />

            <Select
              selectedKeys={[currency]}
              onSelectionChange={(key) => {
                setCurrency(key.currentKey?.toString() as Currencies);
                setAmount("");
              }}
              isDisabled={isPending}
              label="Currency"
              labelPlacement="outside"
              selectionMode="single"
            >
              <SelectItem key="STEEM">STEEM</SelectItem>
              <SelectItem key="SBD">SBD</SelectItem>
            </Select>
          </div>

          <Textarea
            value={memo}
            onValueChange={setMemo}
            label="Memo (Optional)"
            labelPlacement="outside"
            placeholder="Enter memo..."
            minRows={2}
            isDisabled={isPending}
          />

          <Button
            onPress={handleWithdraw}
            className="w-full"
            variant="flat"
            color="danger"
            isLoading={isPending}
            isDisabled={
              !recipient || !amount || parseFloat(amount) <= 0 || isPending
            }
          >
            Withdraw Savings
          </Button>

          <p className="text-xs text-default-500 text-center">
            Withdrawals from savings take 3 days to complete.
          </p>
        </div>
      )}
    </SModal>
  );
};
