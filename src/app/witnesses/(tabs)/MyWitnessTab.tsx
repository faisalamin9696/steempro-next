import React, { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import SAvatar from "@/components/ui/SAvatar";
import { Chip } from "@heroui/chip";
import { BiUserCheck } from "react-icons/bi";
import { Button, ButtonGroup } from "@heroui/button";
import { FaPencil } from "react-icons/fa6";
import { Card } from "@heroui/card";
import { getTimeFromNow } from "@/utils/helper/time";
import { useLogin } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { FiSettings } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { updateWitnessConfiguration } from "@/libs/steem/condenser";
import { useAppSelector } from "@/constants/AppFunctions";
import SModal from "@/components/ui/SModal";
import KeychainButton from "@/components/KeychainButton";
import WitnessItemCard from "@/components/WitnessItemCard";

type Props = {
  witness: MergedWitness;
};
const DISABLE_EY = "STM1111111111111111111111111111111114T1Anm";

function MyWitnessTab(props: Props) {
  const [witness, setWitness] = useState(props.witness);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const { isOpen, onOpenChange } = useDisclosure();
  const originalValues = useRef({
    signKey: witness.signing_key,
    url: witness.url,
    interestRate: witness.props.sbd_interest_rate.toString(),
    creationFee: parseFloat(witness.props.account_creation_fee).toFixed(3),
  });
  const [signKey, setSignKey] = useState(originalValues.current.signKey);
  const [url, setUrl] = useState(originalValues.current.url);
  const [interestRate, setInterestRate] = useState(
    originalValues.current.interestRate
  );
  const [creationFee, setCreationFee] = useState(
    originalValues.current.creationFee
  );
  const isDisabling = signKey === DISABLE_EY;
  const hasChanged = () => {
    return (
      signKey !== originalValues.current.signKey ||
      url !== originalValues.current.url ||
      interestRate !== originalValues.current.interestRate ||
      creationFee !== originalValues.current.creationFee
    );
  };

  const mutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      Promise.all([
        updateWitnessConfiguration(
          loginInfo,
          {
            ...witness,
            signing_key: signKey,
            url: url,
            props: {
              ...witness.props,
              sbd_interest_rate: parseFloat(interestRate),
              account_creation_fee: `${creationFee} STEEM`,
            },
          },
          data.key,
          data.isKeychain
        ),
      ]),
    onSuccess(data, variables, context) {
      toast.success(
        isDisabling
          ? "Witness disabled successfully"
          : "Witness configuration updated"
      );
      setWitness({
        ...witness,
        signing_key: signKey,
        url: url,
        props: {
          ...witness.props,
          sbd_interest_rate: parseFloat(interestRate),
          account_creation_fee: `${creationFee} STEEM`,
        },
      });
      onOpenChange();
    },
    onError(error, variables, context) {
      toast.error(error.message || JSON.stringify(error));
    },
  });

  function resetFields() {
    setCreationFee(parseFloat(witness.props.account_creation_fee).toFixed(3));
    setInterestRate(witness.props.sbd_interest_rate?.toString());
    setUrl(witness.url);
    setSignKey(witness.signing_key);
  }
  function handleUpdateWitness(isKeychain?: boolean) {
    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    mutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  return (
    <div className="border border-gray-200/20 rounded-lg p-3 sm:p-4">
      <div
        key={witness.name}
        className={twMerge(`p-4`, witness.isDisabled ? "opacity-60" : "")}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <WitnessItemCard witness={witness} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <DetailItem
                title="Created"
                subTitle={new Date(witness.created * 1000)?.toLocaleString()}
              />
              <DetailItem
                title="Last sync"
                subTitle={new Date(witness.last_sync * 1000)?.toLocaleString()}
              />

              <DetailItem
                title="Last price"
                subTitle={
                  <div className="text-sm flex flex-row gap-1">
                    <p>
                      {parseFloat(witness.reported_price.base)?.toFixed(3)}/
                      {parseFloat(witness.reported_price.quote).toFixed(3)}
                    </p>
                    <p
                      className="text-default-600"
                      title={new Date(
                        witness.last_price_report * 1000
                      ).toLocaleString()}
                    >
                      • {getTimeFromNow(witness.last_price_report * 1000)}
                    </p>
                  </div>
                }
              />

              <DetailItem
                title="Produced blocks"
                subTitle={witness.produced_blocks}
              />

              <DetailItem
                title="Interest rate"
                subTitle={witness.props.sbd_interest_rate}
              />

              <DetailItem
                title="Account creation fee"
                subTitle={witness.props.account_creation_fee}
              />
            </div>

            <DetailItem title="Url" subTitle={witness.url} />

            <DetailItem title="Signing Key" subTitle={witness.signing_key} />
          </div>
          <div className="flex gap-2">
            <ButtonGroup size="sm">
              {!witness.isDisabledByKey && (
                <Button
                  size="sm"
                  variant="flat"
                  className="px-2 sm:px-3"
                  color="danger"
                  isDisabled={witness.isDisabled}
                  onPress={() => {
                    setSignKey(DISABLE_EY);
                    onOpenChange();
                  }}
                >
                  Disable
                </Button>
              )}

              <Button
                size="sm"
                variant="flat"
                className=" px-2 sm:px-3"
                onPress={() => {
                  setSignKey(witness.signing_key);
                  onOpenChange();
                }}
              >
                <FaPencil size={14} />
                Edit
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      <SModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        modalProps={{
          hideCloseButton: true,
          isDismissable: !mutation.isPending,
        }}
        title={() => (
          <div className="flex flex-row gap-2 items-center">
            <FiSettings size={18} />
            Witness Configuration
          </div>
        )}
        body={() => (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Input
                color={isDisabling ? "danger" : "default"}
                label={`Signing key ${isDisabling ? "(Disable key)" : ""}`}
                value={signKey}
                onValueChange={(value) => setSignKey(value.trim())}
                isDisabled={isDisabling || mutation.isPending}
              />

              <Input
                label="Url"
                value={url}
                onValueChange={(value) => setUrl(value.trim())}
                isDisabled={mutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                className="sm:flex-[1] sm:max-w-[150px]"
                label="Interest rate"
                value={interestRate}
                onValueChange={(value) => setInterestRate(value.trim())}
                isDisabled={isDisabling || mutation.isPending}
              />

              <Input
                className="sm:flex-[3]"
                label="Account creation fee (STEEM)"
                value={creationFee}
                onValueChange={(value) => setCreationFee(value.trim())}
                isDisabled={isDisabling || mutation.isPending}
              />
            </div>
          </div>
        )}
        footer={(onClose) => (
          <div className="flex flex-row justify-between items-center w-full">
            <KeychainButton
              isDisabled={(!isDisabling && !hasChanged()) || mutation.isPending}
              onPress={() => handleUpdateWitness(true)}
            />

            <div className="flex flex-row gap-2 items-center">
              <Button
                color="default"
                variant="light"
                onPress={() => {
                  resetFields();
                  onClose();
                }}
                isDisabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color={isDisabling ? "danger" : "success"}
                onPress={() => handleUpdateWitness()}
                className={`${isDisabling ? "text-white" : ""}`}
                isLoading={mutation.isPending}
                isDisabled={!isDisabling && !hasChanged()}
              >
                {isDisabling ? "Disable" : "Update"}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default MyWitnessTab;

const DetailItem = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string | React.ReactNode;
}) => {
  return (
    <Card>
      <div className="flex flex-col gap-2 p-2 text-sm">
        <p className="text-xs text-default-500">{title}</p>
        <div className="break-words break-all whitespace-normal">
          {subTitle}
        </div>
      </div>
    </Card>
  );
};
