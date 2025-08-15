import React, { useEffect, useState } from "react";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import SAvatar from "./ui/SAvatar";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { validate_account_name } from "@/utils/chainValidation";
import KeychainButton from "./KeychainButton";
import { twMerge } from "tailwind-merge";
import SModal from "./ui/SModal";

type AssetTypes = "STEEM" | "SBD" | "VESTS";

interface BasicProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelegationSuccess?: (vests: number) => void;
  asset: AssetTypes;
  powewrup?: boolean;
  savings?: boolean;
  delegation?: any;
  delegatee?: string;
  oldDelegation?: number;
  isRemove?: boolean;
}

type DelegationProps = BasicProps & {
  delegation: boolean;
  delegatee: string;
  oldDelegation?: number;
  isRemove?: boolean;
};
type PowerupProps = BasicProps & {
  powewrup: boolean;
};
type SavingProps = BasicProps & {
  savings: boolean;
};
type Props = DelegationProps | PowerupProps | SavingProps;

const TransferModal = (props: Props): React.ReactNode => {
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
  } = props;
  const [asset, setAsset] = useState(props.asset);
  const [basic, setBasic] = useState(savings || powewrup);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const oldSpDelegation = !!oldDelegation
    ? vestToSteem(oldDelegation, globalData.steem_per_share)
    : undefined;

  const dispatch = useAppDispatch();
  const [confirmCheck, setConfirmCheck] = useState(false);
  const { isAuthorizedActive, authenticateUserActive } = useLogin();

  let [from, setFrom] = useState(loginInfo.name);
  let [to, setTo] = useState(
    delegation ? delegatee || "" : savings || powewrup ? loginInfo.name : ""
  );
  let [amount, setAmount] = useState(
    isRemove ? "0" : oldSpDelegation?.toFixed(3) || ""
  );
  let [memo, setMemo] = useState("");

  const [toImage, setToImage] = useState("");

  const availableBalance =
    asset === "VESTS"
      ? vestToSteem(
          loginInfo.vests_own -
            loginInfo.vests_out -
            loginInfo.powerdown +
            loginInfo.powerdown_done,
          globalData.steem_per_share
        ) + (oldSpDelegation ?? 0)
      : asset === "STEEM"
      ? loginInfo.balance_steem
      : loginInfo.balance_sbd;

  useEffect(() => {
    const timeout = setTimeout(() => {
      to = to.trim().toLowerCase();
      if (!validate_account_name(to)) setToImage(to);
    }, 500);

    return () => clearTimeout(timeout);
  }, [to]);

  const transferMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: Transfer;
      isKeychain?: boolean;
    }) => transferAsset(loginInfo, data.key, data.options, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      // check if self transfer
      if (variables.options.from !== variables.options.to)
        if (variables.options.unit === "SBD") {
          dispatch(
            saveLoginHandler({
              ...loginInfo,
              balance_sbd:
                loginInfo.balance_sbd - Number(variables.options.amount),
            })
          );
        } else {
          dispatch(
            saveLoginHandler({
              ...loginInfo,
              balance_steem:
                loginInfo.balance_steem - Number(variables.options.amount),
            })
          );
        }

      props.onOpenChange(false);
      toast.success(t("wallet.transfer_success", { amount, asset, to }));
    },
  });

  const savingsMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: Transfer;
      isKeychain?: boolean;
    }) => transferToSavings(loginInfo, data.key, data.options, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      // substraction in balance and addition in savings
      if (variables.options.unit === "SBD") {
        dispatch(
          saveLoginHandler({
            ...loginInfo,
            savings_sbd:
              from === to
                ? loginInfo.savings_sbd + variables.options.amount
                : loginInfo.balance_sbd - variables.options.amount,
            balance_sbd: loginInfo.balance_sbd - variables.options.amount,
          })
        );
      } else {
        dispatch(
          saveLoginHandler({
            ...loginInfo,
            savings_steem: loginInfo.savings_steem + variables.options.amount,
            balance_steem: loginInfo.balance_steem - variables.options.amount,
          })
        );
      }
      props.onOpenChange(false);
      toast.success(t("wallet.transfer_to_savings_success", { amount, asset, to }));
    },
  });

  const vestingMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: Transfer;
      isKeychain?: boolean;
    }) => transferToVesting(loginInfo, data.key, data.options, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          balance_steem: loginInfo.balance_steem - variables.options.amount,
          vests_own:
            from === to
              ? loginInfo.vests_own +
                steemToVest(
                  variables.options.amount,
                  globalData.steem_per_share
                )
              : loginInfo.vests_own,
        })
      );

      props.onOpenChange(false);
      toast.success(t("wallet.power_up_success", { amount, asset, to }));
    },
  });

  const delegateMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: {
        delegatee: string;
        amount: number;
      };
      isKeychain?: boolean;
    }) =>
      delegateVestingShares(
        loginInfo,
        data.key,
        data.options,
        data.isKeychain,
        globalData
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      const outVests = steemToVest(
        variables.options.amount,
        globalData.steem_per_share
      );

      onDelegationSuccess && onDelegationSuccess(outVests);

      dispatch(
        saveLoginHandler({
          ...loginInfo,
          vests_out: loginInfo.vests_out + outVests,
        })
      );
      props.onOpenChange(false);
      toast.success(
        isRemove ? t("wallet.delegation_removed") : t("wallet.delegation_success", { amount, to })
      );
    },
  });

  async function handleTransfer(isKeychain?: boolean) {
    from = from.trim().toLowerCase();
    to = to.trim().toLowerCase();
    amount = amount.trim();
    memo = memo.trim();

    if (!to || !amount || !from) {
      toast.info("Some fields are empty");
      return;
    }

    if (validate_account_name(to)) {
      toast.info("Invalid username");
      return;
    }
    if (!isNumeric(amount)) {
      toast.info("Invalid amount");
      return;
    }

    if (delegation && from === to) {
      toast.info(" You cannot delegate SP to yourself");
      return;
    }

    if (Number(amount) > availableBalance) {
      toast.info("Insufficient funds");
      return;
    }

    if (!isRemove && delegation && Number(amount) < 1) {
      toast.info(" The minimum required delegation amount is 1.000 SP");
      return;
    }

    if (!isRemove && Number(amount) < 0.001) {
      toast.info("Use only 3 digits of precison");
      return;
    }

    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }

    if (!credentials?.key) {
      toast.error(t("common.invalid_credentials"));
      return;
    }

    if (savings) {
      savingsMutation.mutate({
        key: credentials?.key ?? "",
        options: {
          from,
          to,
          amount: Number(amount),
          memo,
          unit: asset,
          time: moment.now(),
        },
        isKeychain: isKeychain || credentials.keychainLogin,
      });
      return;
    }

    if (powewrup) {
      vestingMutation.mutate({
        key: credentials?.key ?? "",
        options: {
          from,
          to,
          amount: Number(amount),
          memo,
          unit: asset,
          time: moment.now(),
        },
        isKeychain: isKeychain || credentials.keychainLogin,
      });
      return;
    }

    if (delegation) {
      delegateMutation.mutate({
        key: credentials?.key ?? "",
        options: {
          delegatee: to,
          amount: isRemove ? 0 : Number(amount),
        },
        isKeychain: isKeychain || credentials.keychainLogin,
      });
      return;
    }

    if (!savings && !powewrup && !delegation)
      transferMutation.mutate({
        key: credentials?.key ?? "",
        options: {
          from,
          to,
          amount: Number(amount),
          memo,
          unit: asset,
          time: moment.now(),
        },
        isKeychain: isKeychain || credentials.keychainLogin,
      });
  }

  const { t } = useLanguage();

  const isPending =
    transferMutation.isPending ||
    savingsMutation.isPending ||
    vestingMutation.isPending ||
    delegateMutation.isPending;

  const title = delegation
    ? isRemove
      ? "Remove Delegation"
      : oldDelegation
      ? "Update Delegation"
      : "Delegate to Account"
    : powewrup
    ? "Convert to STEEM POWER"
    : `Transfer to ${savings ? "Savings" : "Account"}`;

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        placement: "center",
        isDismissable: false,
        hideCloseButton: true,
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
                onValueChange={setTo}
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
                variant="flat"
                onChange={(key) => {
                  setAsset(key.target.value as AssetTypes);
                }}
                disallowEmptySelection
                selectedKeys={[asset]}
                isDisabled={powewrup || delegation || isPending}
                size="sm"
                placeholder="Asset"
                className=" max-w-[100px]"
                selectorIcon={delegation && <></>}
                classNames={{
                  value: "text-tiny",
                  innerWrapper: delegation ? "w-15" : " w-10",
                }}
              >
                <SelectItem className="text-xs" key={"STEEM"}>
                  {"STEEM"}
                </SelectItem>
                <SelectItem key={"SBD"}>{"SBD"}</SelectItem>
                <SelectItem
                  key={"VESTS"}
                  className={twMerge(delegation ? "block" : "hidden")}
                >
                  {"STEEM POWER"}
                </SelectItem>
              </Select>
            }
            description={
              <div className="ps-1 flex flex-row gap-4 items-center">
                <p>Available balance: </p>
                <button
                  className=" font-mono"
                  onClick={() => {
                    setAmount(availableBalance?.toFixed(3)?.toString());
                  }}
                >
                  {availableBalance?.toLocaleString()}{" "}
                  {delegation ? "SP" : asset}
                </button>
              </div>
            }
          />

          {!savings && !powewrup && !delegation && (
            <Textarea
              spellCheck={"false"}
              value={memo}
              onValueChange={setMemo}
              label="Memo"
            />
          )}
          <div className="flex flex-row justify-between">
            <Checkbox
              size="sm"
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
                : `Transfer`}
            </Checkbox>
          </div>
        </div>
      )}
      footer={(onClose) => (
        <div className="flex flex-row w-full justify-between items-center">
          <KeychainButton
            isDisabled={!confirmCheck || isPending}
            onPress={() => handleTransfer(true)}
          />

          <div className=" flex flex-row items-center gap-2">
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={onClose}
              isDisabled={isPending}
            >
              Cancel
            </Button>

            {(savings || powewrup) && (
              <Button
                size="sm"
                onPress={() => setBasic(!basic)}
                variant="flat"
                isDisabled={isPending}
              >
                {basic ? "Advance" : "Basic"}
              </Button>
            )}

            <Button
              size="sm"
              color="primary"
              onPress={() => handleTransfer()}
              isLoading={isPending}
              isDisabled={!confirmCheck || isPending}
            >
              {delegation
                ? isRemove
                  ? "Remove"
                  : !!oldDelegation
                  ? "Update"
                  : "Delegate"
                : powewrup
                ? "Power Up"
                : "Transfer"}
            </Button>
          </div>
        </div>
      )}
    />
  );
};

export default TransferModal;
