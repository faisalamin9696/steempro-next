import React, { useEffect, useMemo, useState } from "react";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import SAvatar from "./ui/SAvatar";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import {
  delegateVestingShares,
  transferAsset,
  transferToSavings,
  transferToVesting,
} from "@/libs/steem/condenser";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import moment from "moment";
import { steemToVest, vestToSteem } from "@/utils/helper/vesting";
import { isNumeric } from "@/utils/helper";
import {
  validate_account_name,
  validate_exchange_account_with_memo,
} from "@/utils/chainValidation";
import KeychainButton from "./KeychainButton";
import { twMerge } from "tailwind-merge";
import SModal from "./ui/SModal";
import Fuse from "fuse.js";
import VerifiedExchangeList from "@/utils/VerifiedExchangeList";

type AssetTypes = "STEEM" | "SBD" | "VESTS";

interface BasicProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelegationSuccess?: (vests: number) => void;
  asset: AssetTypes;
}

type TransferModalProps = BasicProps & {
  powewrup?: boolean;
  savings?: boolean;
  delegation?: boolean;
  delegatee?: string;
  oldDelegation?: number;
  isRemove?: boolean;
};

const TransferModal = (props: TransferModalProps) => {
  const {
    savings,
    powewrup,
    delegation,
    delegatee,
    oldDelegation,
    isRemove,
    onDelegationSuccess,
    isOpen,
    onOpenChange,
    asset: initialAsset,
  } = props;

  // State management
  const [asset, setAsset] = useState(initialAsset);
  const [basic, setBasic] = useState(savings || powewrup);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [warnCheck, setWarnCheck] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [toImage, setToImage] = useState("");
  const [similarityPercentage, setSimilarityPercentage] = useState(0);
  const [similarAccountName, setSimilarAccountName] = useState<string | null>(
    ""
  );

  // Redux and hooks
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const dispatch = useAppDispatch();
  const { isAuthorizedActive, authenticateUserActive } = useLogin();

  // Derived values
  const isTransferToAccount = !savings && !powewrup && !delegation;
  const oldSpDelegation = useMemo(
    () =>
      oldDelegation
        ? vestToSteem(oldDelegation, globalData.steem_per_share)
        : undefined,
    [oldDelegation, globalData.steem_per_share]
  );

  const availableBalance = useMemo(() => {
    if (asset === "VESTS") {
      return (
        vestToSteem(
          loginInfo.vests_own -
            loginInfo.vests_out -
            loginInfo.powerdown +
            loginInfo.powerdown_done,
          globalData.steem_per_share
        ) + (oldSpDelegation ?? 0)
      );
    }
    return asset === "STEEM" ? loginInfo.balance_steem : loginInfo.balance_sbd;
  }, [asset, loginInfo, globalData.steem_per_share, oldSpDelegation]);

  // Initialize form values
  useEffect(() => {
    setFrom(loginInfo.name);
    setTo(
      delegation ? delegatee || "" : savings || powewrup ? loginInfo.name : ""
    );
    setAmount(isRemove ? "0" : oldSpDelegation?.toFixed(3) || "");
  }, [
    loginInfo.name,
    delegation,
    delegatee,
    savings,
    powewrup,
    isRemove,
    oldSpDelegation,
  ]);

  // Account verification
  const fuse = useMemo(
    () =>
      new Fuse(VerifiedExchangeList, {
        includeScore: true,
        threshold: 0.4,
      }),
    []
  );

  const [transferChecks, setTransferChecks] = useState({
    isVerifiedAccount: false,
    isSuspiciousAccount: false,
    exchangeValidation: false,
  });

  const renderWarn = useMemo(
    () =>
      (transferChecks.isVerifiedAccount ||
        transferChecks.exchangeValidation ||
        transferChecks.isSuspiciousAccount) &&
      isTransferToAccount,
    [transferChecks, isTransferToAccount]
  );

  const getCharMatchInfo = (input: string, target: string) => {
    const result = {
      percentage: 0,
      exactMatch: false,
      isSubstring: false,
      containsOriginal: false,
      noMatch: true,
    };

    if (!input || !target) return result;

    input = input.toLowerCase();
    target = target.toLowerCase();

    if (input === target) {
      result.percentage = 100;
      result.exactMatch = true;
      result.noMatch = false;
    } else if (target.includes(input)) {
      result.percentage = Math.round((input.length / target.length) * 100);
      result.isSubstring = true;
      result.noMatch = false;
    } else if (input.includes(target)) {
      result.percentage = Math.round((target.length / input.length) * 100);
      result.containsOriginal = true;
      result.noMatch = false;
    }

    return result;
  };

  const checkExchangeStatus = (accountName: string) => {
    const lowerName = accountName.trim().toLowerCase();
    const isVerified = VerifiedExchangeList.includes(lowerName);
    let similarityPercentage = 0;
    let similarAccountName: string | null = null;
    let isSuspicious = false;

    const fuzzyResults = fuse.search(lowerName);
    const exchangeValidation = validate_exchange_account_with_memo(accountName);

    if ((!isVerified && fuzzyResults.length > 0) || exchangeValidation) {
      const topResult = fuzzyResults[0];
      similarAccountName = topResult.item;
      const score = Math.round((1 - (topResult?.score || 0)) * 100);
      const matchInfo = getCharMatchInfo(accountName, similarAccountName);
      const finalScore = Math.round((matchInfo.percentage + score) / 2);

      similarityPercentage = finalScore;
      isSuspicious = finalScore >= 70;
    }

    setTransferChecks({
      isVerifiedAccount: isVerified,
      isSuspiciousAccount: isSuspicious,
      exchangeValidation: exchangeValidation || false,
    });
    setSimilarityPercentage(similarityPercentage);
    setSimilarAccountName(similarAccountName);
  };

  // Avatar image update
  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmedTo = to.trim().toLowerCase();
      if (!validate_account_name(trimmedTo)) setToImage(trimmedTo);
    }, 500);

    return () => clearTimeout(timeout);
  }, [to]);

  // Mutation handlers
  const createMutationHandler = (mutationFn: any, successMessage: string) => ({
    mutationFn,
    onSettled: (data: any, error: any, variables: any) => {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      // Handle success
      props.onOpenChange(false);
      toast.success(successMessage);
    },
  });

  const transferMutation = useMutation(
    createMutationHandler(
      (data: { key: string; options: any; isKeychain?: boolean }) =>
        transferAsset(loginInfo, data.key, data.options, data.isKeychain),
      `${amount} ${asset} transferred to ${to}`
    )
  );

  const savingsMutation = useMutation(
    createMutationHandler(
      (data: { key: string; options: any; isKeychain?: boolean }) =>
        transferToSavings(loginInfo, data.key, data.options, data.isKeychain),
      `${amount} ${asset} transferred to ${to}'s savings`
    )
  );

  const vestingMutation = useMutation(
    createMutationHandler(
      (data: { key: string; options: any; isKeychain?: boolean }) =>
        transferToVesting(loginInfo, data.key, data.options, data.isKeychain),
      `${amount} ${asset} powered up to ${to}`
    )
  );

  const delegateMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: { delegatee: string; amount: number };
      isKeychain?: boolean;
    }) =>
      delegateVestingShares(
        loginInfo,
        data.key,
        data.options,
        data.isKeychain,
        globalData
      ),
    onSettled: (data, error, variables) => {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      const outVests = steemToVest(
        variables.options.amount,
        globalData.steem_per_share
      );
      onDelegationSuccess?.(outVests);

      dispatch(
        saveLoginHandler({
          ...loginInfo,
          vests_out: loginInfo.vests_out + outVests,
        })
      );

      props.onOpenChange(false);
      toast.success(
        isRemove ? "Delegation removed" : `${amount} SP delegated to ${to}`
      );
    },
  });

  const handleTransfer = async (isKeychain?: boolean) => {
    const trimmedFrom = from.trim().toLowerCase();
    const trimmedTo = to.trim().toLowerCase();
    const trimmedAmount = amount.trim();
    const trimmedMemo = memo.trim();

    // Validation checks
    if (!trimmedTo || !trimmedAmount || !trimmedFrom) {
      toast.info("Some fields are empty");
      return;
    }

    if (validate_account_name(trimmedTo)) {
      toast.info("Invalid username");
      return;
    }

    if (!isNumeric(trimmedAmount)) {
      toast.info("Invalid amount");
      return;
    }

    if (delegation && trimmedFrom === trimmedTo) {
      toast.info("You cannot delegate SP to yourself");
      return;
    }

    if (Number(trimmedAmount) > availableBalance) {
      toast.info("Insufficient funds");
      return;
    }

    if (!isRemove && delegation && Number(trimmedAmount) < 1) {
      toast.info("The minimum required delegation amount is 1.000 SP");
      return;
    }

    if (!isRemove && Number(trimmedAmount) < 0.001) {
      toast.info("Use only 3 digits of precision");
      return;
    }

    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key) || !credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    const commonOptions = {
      from: trimmedFrom,
      to: trimmedTo,
      amount: Number(trimmedAmount),
      memo: trimmedMemo,
      unit: asset,
      time: moment.now(),
    };

    if (savings) {
      savingsMutation.mutate({
        key: credentials.key,
        options: commonOptions,
        isKeychain: isKeychain || credentials.keychainLogin,
      });
    } else if (powewrup) {
      vestingMutation.mutate({
        key: credentials.key,
        options: commonOptions,
        isKeychain: isKeychain || credentials.keychainLogin,
      });
    } else if (delegation) {
      delegateMutation.mutate({
        key: credentials.key,
        options: {
          delegatee: trimmedTo,
          amount: isRemove ? 0 : Number(trimmedAmount),
        },
        isKeychain: isKeychain || credentials.keychainLogin,
      });
    } else {
      transferMutation.mutate({
        key: credentials.key,
        options: commonOptions,
        isKeychain: isKeychain || credentials.keychainLogin,
      });
    }
  };

  const isPending =
    transferMutation.isPending ||
    savingsMutation.isPending ||
    vestingMutation.isPending ||
    delegateMutation.isPending;

  const title = useMemo(() => {
    if (delegation) {
      return isRemove
        ? "Remove Delegation"
        : oldDelegation
        ? "Update Delegation"
        : "Delegate to Account";
    }
    return powewrup
      ? "Convert to STEEM POWER"
      : `Transfer to ${savings ? "Savings" : "Account"}`;
  }, [delegation, isRemove, oldDelegation, powewrup, savings]);

  const actionButtonText = useMemo(() => {
    if (delegation)
      return isRemove ? "Remove" : oldDelegation ? "Update" : "Delegate";
    return powewrup ? "Power Up" : "Transfer";
  }, [delegation, isRemove, oldDelegation, powewrup]);

  const WarningMessages = {
    verified: (
      <div className="prose-sm alert callout">
        <div className="row">
          <div className="column">
            <strong>Exchange Account Detected</strong>
            <br />
            <p>
              To prevent irreversible loss of funds, please ensure the
              following:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>
                Use the correct memo and deposit address provided by the
                exchange.
              </li>
              <li style={{ marginBottom: "8px" }}>
                Verify that the exchange has not suspended deposits.
              </li>
              <li>Verify that the exchange still supports {asset} deposits.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    suspicious: (
      <div className="prose-sm warning callout">
        <div className="row">
          <div className="column">
            <strong>Exchange Account Similarity Detected</strong>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>
                The recipient address shares {similarityPercentage}% similarity
                with a known exchange account (
                <strong>@{similarAccountName}</strong>). Verify the address
                carefully, as incorrect transfers may result in permanent loss
                of funds.
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
    validation: (
      <div className="prose-sm warning callout">
        <div className="row">
          <div className="column">
            The recipient address appears to be an intentional misspelling of a
            known exchange account. It is strongly recommended not to send any
            funds.
          </div>
        </div>
      </div>
    ),
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        isDismissable: false,
        hideCloseButton: true,
        size: "2xl",
      }}
      title={() => title}
      body={() => (
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 items-center">
            <Input
              label="From"
              size="sm"
              isReadOnly
              autoCapitalize="off"
              isRequired
              value={from}
              onValueChange={setFrom}
              endContent={<SAvatar size="xs" username={from} />}
            />
            {(!basic || delegation) && (
              <Input
                isRequired
                label="To"
                size="sm"
                autoCapitalize="off"
                value={to}
                inputMode="text"
                onValueChange={(value) => {
                  setTo(value);
                  checkExchangeStatus(value);
                }}
                isDisabled={!!oldDelegation || !!isRemove || isPending}
                endContent={<SAvatar size="xs" username={toImage} />}
              />
            )}
          </div>

          <Input
            isRequired
            label="Amount"
            size="sm"
            value={amount}
            onValueChange={setAmount}
            type="number"
            min={0}
            isDisabled={!!isRemove}
            step={0.001}
            endContent={
              <Select
                aria-label="Select asset"
                variant="faded"
                onChange={(key) => setAsset(key.target.value as AssetTypes)}
                disallowEmptySelection
                selectedKeys={[asset]}
                isDisabled={powewrup || delegation || isPending}
                size="sm"
                placeholder="Asset"
                className="max-w-[100px]"
                selectorIcon={delegation && <></>}
                classNames={{
                  value: "text-tiny",
                  innerWrapper: delegation ? "w-15" : "w-10",
                }}
              >
                <SelectItem key="STEEM">STEEM</SelectItem>
                <SelectItem key="SBD">SBD</SelectItem>
                <SelectItem
                  key="VESTS"
                  className={twMerge(delegation ? "block" : "hidden")}
                >
                  STEEM POWER
                </SelectItem>
              </Select>
            }
            description={
              <div className="ps-1 flex flex-row gap-4 items-center">
                <p>Available balance: </p>
                <button
                  className="font-mono"
                  onClick={() =>
                    setAmount(availableBalance?.toFixed(3)?.toString())
                  }
                >
                  {availableBalance?.toLocaleString()}{" "}
                  {delegation ? "SP" : asset}
                </button>
              </div>
            }
          />

          {isTransferToAccount && (
            <Textarea
              spellCheck={"false"}
              value={memo}
              onValueChange={setMemo}
              label="Memo"
              autoCapitalize="off"
              isDisabled={isPending}
              inputMode="text"
              isRequired={
                isTransferToAccount && transferChecks.isVerifiedAccount
              }
            />
          )}

          {transferChecks.isVerifiedAccount &&
            isTransferToAccount &&
            WarningMessages.verified}
          {!transferChecks.isVerifiedAccount &&
            transferChecks.isSuspiciousAccount &&
            isTransferToAccount &&
            WarningMessages.suspicious}
          {transferChecks.exchangeValidation &&
            isTransferToAccount &&
            WarningMessages.validation}

          {renderWarn && (
            <Checkbox
              size="md"
              isSelected={warnCheck}
              isDisabled={isPending}
              onValueChange={setWarnCheck}
            >
              I have read and understood the above warnings
            </Checkbox>
          )}

          <div className="flex flex-row justify-between">
            <Checkbox
              size="md"
              isSelected={confirmCheck}
              isDisabled={isPending}
              onValueChange={setConfirmCheck}
            >
              Confirm{" "}
              {powewrup
                ? "Power Up"
                : isRemove
                ? "Remove"
                : delegation
                ? "Delegation"
                : "Transfer"}
            </Checkbox>
          </div>
        </div>
      )}
      footer={() => (
        <div className="flex flex-row w-full justify-between items-center">
          <KeychainButton
            isDisabled={!confirmCheck || isPending}
            onPress={() => handleTransfer(true)}
          />

          <div className="flex flex-row items-center gap-2">
            <Button
              size="md"
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
              isDisabled={isPending}
            >
              Cancel
            </Button>

            {(savings || powewrup) && (
              <Button
                size="md"
                onPress={() => {
                  setTo(from);
                  setBasic(!basic);
                }}
                variant="flat"
                isDisabled={isPending}
              >
                {basic ? "Advance" : "Basic"}
              </Button>
            )}

            <Button
              size="md"
              color="primary"
              onPress={() => handleTransfer()}
              isLoading={isPending}
              isDisabled={
                !confirmCheck ||
                isPending ||
                (!!renderWarn && !warnCheck) ||
                !amount ||
                !to ||
                (isTransferToAccount &&
                  transferChecks.isVerifiedAccount &&
                  !memo)
              }
            >
              {actionButtonText}
            </Button>
          </div>
        </div>
      )}
    />
  );
};

export default TransferModal;
