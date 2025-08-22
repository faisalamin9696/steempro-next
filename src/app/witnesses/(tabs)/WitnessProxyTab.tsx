import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import React, { useState } from "react";
import { WitnessDataProps } from "../page";
import { useMutation } from "@tanstack/react-query";
import { updateAccountRecovery } from "@/libs/steem/condenser";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { useLogin } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { SiTraefikproxy } from "react-icons/si";
import { BsFillInfoCircleFill } from "react-icons/bs";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";

interface Props {
  data: WitnessDataProps;
}

function WitnessProxyTab(props: Props) {
  const { userData } = props.data;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const dispatch = useAppDispatch();
  const [proxyAccount, setProxyAccount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const currentProxy = userData?.proxy || "";

  const mutation = useMutation({
    mutationFn: (data: {
      removeProxy?: boolean;
      key: string;
      isKeychain?: boolean;
    }) =>
      Promise.all([
        updateAccountRecovery(
          loginInfo,
          data.removeProxy ? "" : proxyAccount,
          data.key,
          data.isKeychain
        ),
      ]),
    onSuccess(data, variables, context) {
      toast.success(
        proxyAccount
          ? `Witness proxt set to ${proxyAccount}`
          : "Witness proxy removed"
      );

      setProxyAccount("");
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          proxy: variables.removeProxy ? "" : proxyAccount,
          witness_votes: [],
        })
      );
    },
    onError(error, variables, context) {
      toast.error(error.message || JSON.stringify(error));
    },
  });

  function handleSetProxy(removeProxy?: boolean, isKeychain?: boolean) {
    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) return;

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    mutation.mutate({
      removeProxy: removeProxy,
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  return (
    <Card className="space-y-4">
      <CardHeader className="flex flex-col sm:flex-row justify-between w-full">
        <CardBody className="flex flex-row text-default-800 items-center gap-2 text-lg sm:text-xl font-semibold">
          <SiTraefikproxy size={24} />
          Witness Voting Proxy
        </CardBody>
        <CardBody className="text-default-500 text-sm text-end">
          Delegate your witness voting power to a trusted account
        </CardBody>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Proxy account"
          value={proxyAccount}
          onChange={(e) => setProxyAccount(e.target.value)}
          placeholder="username"
          isDisabled={mutation.isPending || isOpen}
        />

        <div className="warning p-3 sm:p-4">
          <p className="flex flex-row items-center gap-2 mb-2 text-sm sm:text-base font-semibold">
            <BsFillInfoCircleFill /> About Proxy Voting:
          </p>
          <ul className="prose-sm" style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            <li>A proxy can vote for witnesses on your behalf.</li>
            <li>You can change or remove your proxy anytime.</li>
            <li>
              Setting a proxy will remove all your personal witness votes.
            </li>
            <li>
              Only assign proxy to someone you fully trust with your voting
              power.
            </li>
            <li>
              This action requires your active key or Steem Keychain
              authorization.
            </li>
          </ul>
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2">
          <h4 className="font-semibold text-default-800 mb-2 text-sm sm:text-base">
            Current Proxy:
          </h4>
          <div className="flex items-center gap-10">
            <span className="text-default-600 text-sm">Set to:</span>
            <Chip
              variant={currentProxy ? "flat" : "bordered"}
              className={
                currentProxy
                  ? "bg-primary-500 text-white"
                  : "text-default-500 border-gray-400"
              }
            >
              {currentProxy || "None"}
            </Chip>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 flex-1">
          <div className="w-full">
            <ConfirmationPopup
              onOpenChangeExternal={setIsOpen}
              buttonTitle={currentProxy ? "Change proxy" : "Set proxy"}
              onConfirm={() => handleSetProxy(false)}
              onKeychainPress={() => handleSetProxy(false, true)}
              title={currentProxy ? "Change proxy" : "Set proxy"}
              subTitle={`Do you really want to ${
                currentProxy ? "change" : "set"
              } vote proxy to ${proxyAccount}?`}
              triggerProps={{
                color: currentProxy ? "success" : "default",
                isDisabled: !proxyAccount || !userData?.name,
                isLoading:
                  mutation.isPending && !mutation.variables.removeProxy,
                className: "w-full flex-1",
              }}
            />
          </div>

          {currentProxy && (
            <div className="w-full">
              <ConfirmationPopup
                onOpenChangeExternal={setIsOpen}
                buttonTitle="Remove proxy"
                subTitle={`Do you really want to remove vote proxy from ${currentProxy}?`}
                triggerProps={{
                  variant: "bordered",
                  isDisabled: !userData?.name,
                  isLoading:
                    mutation.isPending && mutation.variables.removeProxy,
                  className: "w-full flex-1",
                }}
                onConfirm={() => handleSetProxy(true)}
                title="Remove proxy"
                onKeychainPress={() => handleSetProxy(true, true)}
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default WitnessProxyTab;
