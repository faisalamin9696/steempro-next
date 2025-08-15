import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import React, { useState } from "react";
import { WitnessDataProps } from "../page";
import { useMutation } from "@tanstack/react-query";
import { updateWitnessProxy } from "@/libs/steem/condenser";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { useLogin } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { SiTraefikproxy } from "react-icons/si";
import { BsFillInfoCircleFill } from "react-icons/bs";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";
import { useTranslation } from "@/utils/i18n";

interface Props {
  data: WitnessDataProps;
}

function WitnessProxyTab(props: Props) {
  const { userData } = props.data;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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
        updateWitnessProxy(
          loginInfo,
          data.removeProxy ? "" : proxyAccount,
          data.key,
          data.isKeychain
        ),
      ]),
    onSuccess(data, variables, context) {
      toast.success(
        proxyAccount
          ? t("witnesses.proxy_set_success", { account: proxyAccount })
          : t("witnesses.proxy_removed_success")
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
      toast.error(t("common.invalid_credentials"));
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
          {t("witnesses.proxy_title")}
        </CardBody>
        <CardBody className="text-default-500 text-sm text-end">
          {t("witnesses.proxy_description")}
        </CardBody>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label={t("witnesses.proxy_account")}
          value={proxyAccount}
          onChange={(e) => setProxyAccount(e.target.value)}
          placeholder={t("common.username")}
          isDisabled={mutation.isPending || isOpen}
        />

        <div className="bg-blue-900/20 p-3 sm:p-4">
          <p className="flex flex-row items-center gap-2 text-blue-500 mb-2 text-sm sm:text-base font-semibold">
            <BsFillInfoCircleFill /> {t("witnesses.about_proxy_voting")}:
          </p>
          <ul className="text-xs sm:text-sm text-blue-500 space-y-1">
            <li>• {t("witnesses.proxy_info_1")}</li>
            <li>• {t("witnesses.proxy_info_2")}</li>
            <li>
              • {t("witnesses.proxy_info_3")}
            </li>
            <li>
              • {t("witnesses.proxy_info_4")}
            </li>
            <li>
              • {t("witnesses.proxy_info_5")}
            </li>
          </ul>
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2">
          <h4 className="font-semibold text-default-800 mb-2 text-sm sm:text-base">
            {t("witnesses.current_proxy")}:
          </h4>
          <div className="flex items-center gap-10">
            <span className="text-default-600 text-sm">{t("witnesses.set_to")}:</span>
            <Chip
              variant={currentProxy ? "flat" : "bordered"}
              className={
                currentProxy
                  ? "bg-steem text-white"
                  : "text-default-500 border-gray-400"
              }
            >
              {currentProxy || t("common.none")}
            </Chip>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 flex-1">
          <div className="w-full">
            <ConfirmationPopup
              onOpenChangeExternal={setIsOpen}
              buttonTitle={currentProxy? t("witnesses.change_proxy"): t("witnesses.set_proxy")}
              onConfirm={() => handleSetProxy(false)}
              onKeychainPress={() => handleSetProxy(false, true)}
              title={currentProxy? t("witnesses.change_proxy"): t("witnesses.set_proxy")}
              subTitle={t(currentProxy ? "witnesses.change_proxy_confirmation" : "witnesses.set_proxy_confirmation", { account: proxyAccount })}
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
                buttonTitle={t("witnesses.remove_proxy")}
                subTitle={t("witnesses.remove_proxy_confirmation", { account: currentProxy })}
                triggerProps={{
                  variant: "bordered",
                  isDisabled: !userData?.name,
                  isLoading:
                    mutation.isPending && mutation.variables.removeProxy,
                  className: "w-full flex-1",
                }}
                onConfirm={() => handleSetProxy(true)}
                title={t("witnesses.remove_proxy")}
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
