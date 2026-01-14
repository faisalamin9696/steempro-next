import { useMemo, useState, useEffect } from "react";
import { ArrowUpRight, Repeat } from "lucide-react";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import SInput from "../ui/SInput";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { ExchangeValidationWarning } from "./ExchangeValidationWarning";
import {
  checkExchangeStatus,
  createFuseInstance,
  getWarningType,
} from "@/utils/exchangeValidationUtils";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { normalizeUsername } from "@/utils/editor";
import { useAccountsContext } from "../auth/AccountsContext";

interface TransferModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialRecipient?: string;
}

type Currencies = "STEEM" | "SBD";

export const TransferModal = ({
  isOpen,
  onOpenChange,
  initialRecipient,
}: TransferModalProps) => {
  const { data: session } = useSession();
  const lognData = useAppSelector((s) => s.loginReducer.value);
  let [recipient, setRecipient] = useState(initialRecipient || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currencies>("STEEM");
  const [memo, setMemo] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [warnCheck, setWarnCheck] = useState(false);
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);
  const { authenticateOperation } = useAccountsContext();

  useEffect(() => {
    if (isOpen && initialRecipient) {
      setRecipient(initialRecipient);
    } else if (!isOpen) {
      setRecipient("");
    }
  }, [isOpen, initialRecipient]);

  // State for exchange validation
  const [validationResult, setValidationResult] = useState({
    transferChecks: {
      isVerifiedAccount: false,
      isSuspiciousAccount: false,
      exchangeValidation: false,
    },
    similarityPercentage: 0,
    similarAccountName: null as string | null,
  });

  const dispatch = useAppDispatch();
  const availableBalance =
    currency === "STEEM" ? lognData.balance_steem : lognData.balance_sbd;

  // Fuse instance for fuzzy search
  const fuse = useMemo(createFuseInstance, []);

  // Handle recipient change with validation
  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (value.trim()) {
      const result = checkExchangeStatus(value, fuse);
      setValidationResult(result);
    } else {
      setValidationResult({
        transferChecks: {
          isVerifiedAccount: false,
          isSuspiciousAccount: false,
          exchangeValidation: false,
        },
        similarityPercentage: 0,
        similarAccountName: null,
      });
    }
  };

  // Transfer handler
  const handleTransfer = async (toSavings = false) => {
    recipient = normalizeUsername(recipient);
    setIsPending(true);

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.transfer(
        session?.user?.name!,
        recipient,
        `${parseFloat(amount).toFixed(3)} ${currency}`,
        memo,
        toSavings,
        key,
        useKeychain
      );

      // Update account state
      const updatedAccount = {
        ...lognData,
        savings_sbd: toSavings
          ? lognData.savings_sbd + Number(amount)
          : lognData.savings_sbd,
        balance_steem:
          currency === "STEEM"
            ? lognData.balance_steem - Number(amount)
            : lognData.balance_steem,
        balance_sbd:
          currency === "SBD"
            ? lognData.balance_sbd - Number(amount)
            : lognData.balance_sbd,
      };

      dispatch(addLoginHandler(updatedAccount));

      // Show success toast
      toast.success(toSavings ? "Transfer to Savings" : "Transfer Initiated", {
        description: toSavings
          ? `Moving ${amount} ${currency} to savings`
          : `Sending ${amount} ${currency} to @${recipient}`,
      });
      setConfirmTransfer(false);
      setConfirmSaving(false);
    }).finally(() => {
      setIsPending(false);
    });

    onOpenChange(false);
  };

  // Convert handler
  const handleConvert = async () => {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.convertSBDToSteem(
        session?.user?.name!,
        `${parseFloat(convertAmount).toFixed(3)} SBD`,
        key,
        useKeychain
      );

      dispatch(
        addLoginHandler({
          ...lognData,
          balance_sbd: lognData.balance_sbd - Number(convertAmount),
        })
      );

      toast.success("Conversion Initiated", {
        description: `Converting ${convertAmount} SBD to STEEM`,
      });
      setConfirmConvert(false);
    }).finally(() => {
      setIsPending(false);
    });

    onOpenChange(false);
  };

  // Determine if warnings should be shown
  const shouldShowWarnings = useMemo(() => {
    return Object.values(validationResult.transferChecks).some(
      (check) => check
    );
  }, [validationResult.transferChecks]);

  // Get warning type
  const warningType = getWarningType(validationResult.transferChecks);

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={() => (
        <div className="flex flex-row gap-2 items-center">
          <ArrowUpRight size={20} className="text-primary" />
          <p>Wallet Operations</p>
        </div>
      )}
      size="lg"
    >
      {() => (
        <div className="flex flex-col gap-4">
          {/* Available Balance Card */}
          <Card
            fullWidth
            isPressable
            shadow="none"
            className="p-4 rounded-lg bg-primary/10 border border-primary-200"
            onPress={() => {
              setAmount(availableBalance.toFixed(3));
              if (currency === "SBD")
                setConvertAmount(availableBalance.toFixed(3));
            }}
          >
            <p className="text-sm text-muted mb-1">Available Balance</p>
            <p className="text-2xl font-bold">
              {availableBalance.toLocaleString()}
            </p>
          </Card>

          {/* Tabs */}
          <Tabs
            isDisabled={isPending}
            defaultSelectedKey="transfer"
            fullWidth
            color="primary"
            onSelectionChange={(key) => {
              if (key === "convert") setCurrency("SBD");
            }}
            classNames={{
              panel: "p-0",
            }}
          >
            {/* Transfer Tab */}
            <Tab key="transfer" title="Transfer">
              <div className="flex flex-col gap-4">
                <Input
                  id="from"
                  value={`${session?.user?.name}`}
                  isDisabled
                  label="From"
                  labelPlacement="outside-top"
                  autoCapitalize="off"
                />

                <SInput
                  id="recipient"
                  placeholder="Username"
                  value={recipient}
                  onValueChange={handleRecipientChange}
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
                  classNames={{ input: "resize-y min-h-40px]" }}
                  rows={2}
                  isClearable
                  autoCapitalize="off"
                  isDisabled={isPending}
                />

                {/* Exchange Validation Warnings */}
                {warningType && (
                  <>
                    <ExchangeValidationWarning
                      warningType={warningType}
                      similarityPercentage={
                        validationResult.similarityPercentage
                      }
                      similarAccountName={validationResult.similarAccountName}
                      currency={currency}
                    />

                    <Checkbox
                      size="md"
                      isSelected={warnCheck}
                      isDisabled={
                        isPending ||
                        !recipient ||
                        !amount ||
                        parseFloat(amount) <= 0
                      }
                      onValueChange={(v) => {
                        setWarnCheck(v);
                        if (!v && confirmTransfer) {
                          setConfirmTransfer(false);
                        }
                      }}
                    >
                      I have read and understood the above warnings
                    </Checkbox>
                  </>
                )}

                <Checkbox
                  isDisabled={
                    (warningType && !warnCheck) ||
                    (warningType === "verified" && !memo) ||
                    isPending ||
                    !recipient ||
                    !amount ||
                    parseFloat(amount) <= 0
                  }
                  isSelected={confirmTransfer}
                  onValueChange={setConfirmTransfer}
                >
                  Confirm Transfer
                </Checkbox>

                <Button
                  onPress={() => handleTransfer(false)}
                  className="w-full"
                  variant="flat"
                  color="primary"
                  isLoading={isPending}
                  isDisabled={
                    !confirmTransfer ||
                    !recipient ||
                    !amount ||
                    parseFloat(amount) <= 0
                  }
                >
                  Transfer
                </Button>
              </div>
            </Tab>

            <Tab key={"savings"} title="To Savings">
              <div className="flex flex-col gap-4">
                <Alert
                  color="primary"
                  classNames={{ title: "font-semibold pb-2" }}
                  variant="faded"
                  title="About Savings"
                  description={
                    <p className="text-muted">
                      Funds in savings have a 3-day withdrawal period for added
                      security.
                    </p>
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="savings-amount"
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
                    onSelectionChange={(key) =>
                      setCurrency(key.currentKey?.toString() as any)
                    }
                    isDisabled={isPending}
                    label="Currency"
                    labelPlacement="outside"
                  >
                    <SelectItem key="STEEM">STEEM</SelectItem>
                    <SelectItem key="SBD">SBD</SelectItem>
                  </Select>
                </div>

                <Checkbox
                  isDisabled={isPending || !amount || parseFloat(amount) <= 0}
                  isSelected={confirmSaving}
                  onValueChange={setConfirmSaving}
                >
                  Confirm Transfer
                </Checkbox>

                <Button
                  onPress={() => handleTransfer(true)}
                  className="w-full"
                  isDisabled={
                    !confirmSaving || !amount || parseFloat(amount) <= 0
                  }
                  variant="flat"
                  color="primary"
                  isLoading={isPending}
                >
                  Transfer to Savings
                </Button>
              </div>
            </Tab>
            <Tab key={"convert"} title="Convert SBD">
              <div className="flex flex-col gap-4">
                <Alert
                  color="primary"
                  classNames={{ title: "font-semibold pb-2" }}
                  variant="faded"
                  title="SBD Conversion"
                  description={
                    <p className="text-muted">
                      Convert SBD to STEEM. Takes ~3.5 days to complete at
                      market price.
                    </p>
                  }
                />
                <Input
                  id="convert-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={convertAmount}
                  onValueChange={setConvertAmount}
                  label="Amount (SBD)"
                  labelPlacement="outside-top"
                  isDisabled={isPending}
                />

                <Checkbox
                  isDisabled={
                    isPending ||
                    !convertAmount ||
                    parseFloat(convertAmount) <= 0
                  }
                  isSelected={confirmConvert}
                  onValueChange={setConfirmConvert}
                >
                  Confirm Convert
                </Checkbox>

                <Button
                  onPress={handleConvert}
                  className="w-full"
                  isDisabled={
                    !confirmConvert ||
                    !convertAmount ||
                    parseFloat(convertAmount) <= 0
                  }
                  variant="flat"
                  color="primary"
                  isLoading={isPending}
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  Convert SBD
                </Button>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </SModal>
  );
};
