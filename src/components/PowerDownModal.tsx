import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import SAvatar from "./ui/SAvatar";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { withdrawVesting } from "@/libs/steem/condenser";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import moment from "moment";
import { isNumeric } from "@/utils/helper";
import { Slider } from "@heroui/slider";
import { steemToVest, vestToSteem } from "@/utils/helper/vesting";
import KeychainButton from "./KeychainButton";
import SModal from "./ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cancel?: boolean;
}

const PowerDownModal = (props: Props): React.ReactNode => {
  const { t } = useLanguage();
  const { cancel, isOpen, onOpenChange } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const dispatch = useAppDispatch();
  const [confirmCheck, setConfirmCheck] = useState(cancel || false);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const [amount, setAmount] = useState(cancel ? "0" : "");

  const availableBalance = vestToSteem(
    loginInfo.vests_own -
      loginInfo.vests_out -
      loginInfo.powerdown +
      loginInfo.powerdown_done,
    globalData.steem_per_share
  );

  const withdrawMutation = useMutation({
    mutationFn: (data: { key: string; amount: number; isKeychain?: boolean }) =>
      withdrawVesting(
        loginInfo,
        data.key,
        data.amount,
        data.isKeychain,
        globalData
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      const withdrawVests = steemToVest(
        variables.amount,
        globalData.steem_per_share
      );

      dispatch(
        saveLoginHandler({
          ...loginInfo,
          powerdown: withdrawVests,
          vests_own: cancel
            ? loginInfo.vests_own - loginInfo.powerdown_done
            : loginInfo.vests_own,
          next_powerdown: cancel ? 0 : moment().add(7, "days").unix(),
          powerdown_rate: cancel ? 0 : Number(withdrawVests) / 4,
        })
      );

      onOpenChange(false);
      if (cancel) toast.success(t("wallet.power_down_canceled"));
      else
        toast.success(
          t("wallet.power_down_started", { amount: variables.amount?.toLocaleString() })
        );
    },
  });

  async function handleWithdraw(isKeychain?: boolean) {
    if (!isNumeric(amount)) {
      toast.info(t("wallet.invalid_amount"));
      return;
    }
    if (!cancel && Number(amount) < 0.001) {
      toast.info(t("wallet.use_three_digits_precision"));
      return;
    }

    if (Number(amount) > availableBalance) {
      toast.info(t("wallet.insufficient_funds"));
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

    withdrawMutation.mutate({
      key: credentials?.key ?? "",
      amount: cancel ? 0 : Number(amount),
      isKeychain: isKeychain || credentials.keychainLogin,
    });
  }

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ isDismissable: false, hideCloseButton: true }}
      title={() => (cancel ? "Cancel Power Down" : "" + "Power Down")}
      body={() => (
        <>
          <div className="flex flex-col gap-4 items-start">
            <Slider
              label="Amount"
              radius="lg"
              step={0.001}
              showTooltip
              isDisabled={cancel}
              value={Number(amount)}
              maxValue={availableBalance}
              minValue={0}
              defaultValue={cancel ? 0 : 0.1}
              onChange={(value) => setAmount(String(value))}
              className="max-w-md"
              marks={[
                {
                  value: availableBalance * 0.25,
                  label: "25%",
                },
                {
                  value: availableBalance * 0.5,
                  label: "50%",
                },
                {
                  value: availableBalance * 0.8,
                  label: "80%",
                },
              ]}
            />

            <Input
              label="Amount"
              size="sm"
              isDisabled={cancel}
              isRequired
              value={amount}
              onValueChange={setAmount}
              endContent={<SAvatar size="xs" username={loginInfo.name} />}
            />

            {!!loginInfo.powerdown && (
              <p className="text-tiny text-justify">
                {`You're currently powering down ${vestToSteem(
                  loginInfo.powerdown,
                  globalData.steem_per_share
                )?.toLocaleString()} STEEM, 
                                with ${vestToSteem(
                                  loginInfo.powerdown_done,
                                  globalData.steem_per_share
                                )?.toLocaleString()} STEEM paid out so far. 
                                Changing the power down amount will reset the payout schedule.`}
              </p>
            )}

            {!!loginInfo.vests_out && (
              <p className="text-tiny  text-justify">
                {`You're delegating ${vestToSteem(
                  loginInfo.vests_out,
                  globalData.steem_per_share
                )?.toLocaleString()} STEEM. 
                                This amount is locked and can't be powered down until the delegation is removed, which takes 5 days.`}
              </p>
            )}

            {parseFloat(amount) > availableBalance - 5 && (
              <p className="text-tiny text-justify text-red-400">
                {`Leaving less than 5 STEEM POWER in your account is not recommended and can leave your account in a unusable state.`}
              </p>
            )}
          </div>

          <Checkbox
            size="sm"
            isSelected={confirmCheck}
            isDisabled={withdrawMutation.isPending}
            onValueChange={setConfirmCheck}
          >
            Confirm {(cancel ? "Cancel " : "") + "Power Down"}
          </Checkbox>
        </>
      )}
      footer={(onClose) => (
        <div className="flex flex-row w-full justify-between items-center">
          <KeychainButton
            onPress={() => handleWithdraw(true)}
            isDisabled={!confirmCheck || withdrawMutation.isPending}
          />

          <div className=" flex flex-row items-center gap-2">
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={onClose}
              isDisabled={withdrawMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              color="primary"
              onPress={() => handleWithdraw()}
              isLoading={withdrawMutation.isPending}
              isDisabled={!confirmCheck || withdrawMutation.isPending}
            >
              {(cancel ? "Cancel " : "") + "Power Down"}
            </Button>
          </div>
        </div>
      )}
    />
  );
};

export default PowerDownModal;
