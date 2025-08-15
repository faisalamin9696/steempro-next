import { TokenCard } from "@/components/TokenCard";
import TransferModal from "@/components/TransferModal";
import { useAppSelector } from "@/constants/AppFunctions";
import { vestToSteem } from "@/utils/helper/vesting";
import { useDisclosure } from "@heroui/modal";
import { DropdownMenu, DropdownItem } from "@heroui/dropdown";
import React, { Key, useState } from "react";
import PowerDownModal from "@/components/PowerDownModal";
import { Chip } from "@heroui/chip";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { useSession } from "next-auth/react";
import SLink from "@/components/ui/SLink";
import { useParams, useRouter } from "next/navigation";
import SModal from "@/components/ui/SModal";
import Image from "next/image";
import { useTranslation } from "@/utils/i18n";

const getTokens = (t: (key: string) => string) => ({
  steem: {
    symbol: "STEEM",
    title: "STEEM",
    description: t("wallet.steem_description"),
    shortDesc: t("wallet.steem_short_description"),
    iconSrc: "/steem-logo.svg",
  },
  steem_power: {
    symbol: undefined,
    title: "STEEM POWER",
    description: t("wallet.steem_power_description"),
    shortDesc: t("wallet.steem_power_short_description"),
    iconSrc: "/sp-logo.svg",
  },
  steem_dollar: {
    symbol: undefined,
    title: "STEEM DOLLARS",
    description: t("wallet.steem_dollars_description"),
    iconSrc: "/sbd-logo.svg",
  },
  saving: {
    symbol: undefined,
    title: t("wallet.savings"),
    description: t("wallet.savings_description"),
    iconSrc: "/savings-logo.svg",
  },
});

const steem_power_desc = (username: string, t: (key: string) => string) => (
  <div className=" flex items-center gap-1 line">
    <p>
      {t("wallet.steem_power_full_description").replace("{username}", username)}{" "}
      {
        <SLink
          className=" hover:text-blue-500 hover:underline"
          target="_blank"
          href={
            "https://steemitwallet.com/faq.html#How_many_new_tokens_are_generated_by_the_blockchain"
          }
        >
          {t("wallet.faq")}
        </SLink>
      }{" "}
      {t("wallet.for_details")}
    </p>
  </div>
);

export default function BalanceTab({
  data,
  onDelegationClick,
}: {
  data: AccountExt;
  onDelegationClick?: () => void;
}) {
  const { t } = useTranslation();
  const tokens = getTokens(t);
  const balanceDisclosure = useDisclosure();

  let { username } = useParams() as { username: string };
  username = username?.toLowerCase();
  const { data: session } = useSession();
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const isSelf = session?.user?.name === username;
  const router = useRouter();
  const totalOwnSp = vestToSteem(data.vests_own, globalData.steem_per_share);
  const totalAvailableSp = vestToSteem(
    data.vests_own - data.vests_out - data.powerdown + data.powerdown_done,
    globalData.steem_per_share
  );

  let [key, setKey] = useState<SteemTokens>();
  const [powerDownModal, setPowerDownModal] = useState<{
    isOpen: boolean;
    cancel?: boolean;
  }>({
    isOpen: false,
  });

  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    savings?: boolean;
    powerup?: boolean;
    delegation?: boolean;
    asset: string;
  }>({
    isOpen: false,
    savings: false,
    powerup: false,
    delegation: undefined,
    asset: "STEEM",
  });

  function handleInfo(tokenKey: SteemTokens) {
    key = tokenKey;
    setKey(tokenKey);
    balanceDisclosure.onOpen();
  }

  function handleAction(key: Key) {
    key = key.toString();

    switch (String(key)) {
      case "transfer-steem":
        setTransferModal({ isOpen: true, asset: "STEEM" });
        break;
      case "transfer-sbd":
        setTransferModal({ isOpen: true, asset: "SBD" });

        break;
      case "savings-steem":
        setTransferModal({ isOpen: true, savings: true, asset: "STEEM" });
        break;
      case "savings-sbd":
        setTransferModal({ isOpen: true, savings: true, asset: "SBD" });
        break;
      case "power-up":
        setTransferModal({ isOpen: true, powerup: true, asset: "STEEM" });
        break;

      case "delegation":
        setTransferModal({ isOpen: true, delegation: true, asset: "VESTS" });
        break;

      case "power-down":
        setPowerDownModal({ isOpen: true });
        break;
      case "cancel-power-down":
        setPowerDownModal({ isOpen: true, cancel: true });
        break;

      case "trade":
        router.push("/market");
        break;
    }
  }

  return (
    <div className=" gap-4 grid grid-cols-1 md:grid-cols-2">
      {data && (
        <>
          <TokenCard
            tokenKey="steem"
            iconSrc={tokens.steem.iconSrc}
            symbol={tokens.steem.symbol}
            description={tokens.steem.description}
            shortDesc={tokens.steem.shortDesc}
            title={tokens.steem.title}
            endContent={
              <div className="flex gap-2">
                <p>{data.balance_steem?.toLocaleString()}</p>
              </div>
            }
            actionContent={
              isSelf && (
                <DropdownMenu aria-labelledby={`steem`} onAction={handleAction}>
                  <DropdownItem key="transfer-steem">Transfer</DropdownItem>
                  <DropdownItem key="savings-steem">
                    Transfer to Savings
                  </DropdownItem>
                  <DropdownItem key="power-up">Power Up</DropdownItem>
                  <DropdownItem key="trade">Trade</DropdownItem>
                </DropdownMenu>
              )
            }
            handleInfoClick={handleInfo}
          />

          <TokenCard
            tokenKey="steem_power"
            iconSrc={tokens.steem_power.iconSrc}
            symbol={tokens.steem_power.symbol}
            description={steem_power_desc(username, t)}
            title={tokens.steem_power.title}
            shortDesc={tokens.steem_power.shortDesc}
            endContent={
              <div className="flex flex-col gap-2 items-end ">
                <div className="flex flex-row items-center gap-2">
                  {!!totalOwnSp && totalOwnSp !== totalAvailableSp && (
                    <p
                      title={"Total: " + totalOwnSp?.toLocaleString()}
                      className="text-default-500"
                    >
                      ({totalOwnSp?.toLocaleString()})
                    </p>
                  )}

                  <p title={"Available: " + totalAvailableSp?.toLocaleString()}>
                    {totalAvailableSp?.toLocaleString()} SP
                  </p>
                </div>
                <div className="flex flex-row gap-2 items-center ">
                  {!!data.vests_out && (
                    <Chip
                      title="Outgoing delegation"
                      onClick={onDelegationClick}
                      radius="lg"
                      className="px-0 pl-1 h-6 min-w-0 cursor-pointer"
                      variant="flat"
                      color="warning"
                      startContent={<IoMdRemove size={12} />}
                    >
                      <p className="text-tiny">
                        {vestToSteem(
                          data.vests_out,
                          globalData.steem_per_share
                        )?.toLocaleString()}
                      </p>
                    </Chip>
                  )}

                  {!!data.vests_in && (
                    <Chip
                      title="Incoming delegation"
                      radius="lg"
                      onClick={onDelegationClick}
                      className="px-0 pl-1 h-6 min-w-0 cursor-pointer"
                      variant="flat"
                      color="success"
                      startContent={<IoMdAdd size={14} />}
                    >
                      <p className="text-tiny flex">
                        {vestToSteem(
                          data.vests_in,
                          globalData.steem_per_share
                        )?.toLocaleString()}
                      </p>
                    </Chip>
                  )}
                </div>
              </div>
            }
            actionContent={
              isSelf && (
                <DropdownMenu
                  aria-labelledby={`steem-power`}
                  onAction={handleAction}
                >
                  <DropdownItem key="delegation">{t("wallet.delegate")}</DropdownItem>
                  <DropdownItem key="power-down">{t("wallet.power_down")}</DropdownItem>
                  <DropdownItem
                    className={!!loginInfo.powerdown ? "block" : "hidden"}
                    key="cancel-power-down"
                  >
                    {t("wallet.cancel_power_down")}
                  </DropdownItem>
                </DropdownMenu>
              )
            }
            handleInfoClick={handleInfo}
          />

          <TokenCard
            tokenKey="steem_dollar"
            iconSrc={tokens.steem_dollar.iconSrc}
            description={tokens.steem_dollar.description}
            title={tokens.steem_dollar.title}
            shortDesc={tokens.steem_dollar.description}
            endContent={
              <div>
                <p>${data.balance_sbd?.toLocaleString()} SBD</p>
              </div>
            }
            actionContent={
              isSelf && (
                <DropdownMenu
                  aria-labelledby={`steem-dollar`}
                  onAction={handleAction}
                >
                  <DropdownItem key="transfer-sbd">{t("wallet.transfer")}</DropdownItem>
                  <DropdownItem key="savings-sbd">
                    {t("wallet.transfer_to_savings")}
                  </DropdownItem>
                  <DropdownItem key="trade">{t("wallet.trade")}</DropdownItem>
                </DropdownMenu>
              )
            }
            handleInfoClick={handleInfo}
          />

          <TokenCard
            tokenKey={"saving"}
            iconSrc={tokens.saving.iconSrc}
            shortDesc={tokens.saving.description}
            description={tokens.saving.description}
            title={tokens.saving.title}
            endContent={
              <div className="flex flex-col items-end">
                <p>${data.savings_steem?.toLocaleString()} STEEM</p>
                <p>${data.savings_sbd?.toLocaleString()} SBD</p>
              </div>
            }
            handleInfoClick={handleInfo}
          />
        </>
      )}

      {transferModal.isOpen && (
        <TransferModal
          asset={transferModal.asset as any}
          powewrup={transferModal.powerup}
          savings={transferModal.savings}
          delegation={transferModal.delegation}
          delegatee={isSelf ? "" : username}
          isOpen={transferModal.isOpen}
          onOpenChange={(isOpen) =>
            setTransferModal({ ...transferModal, isOpen: isOpen })
          }
        />
      )}

      {powerDownModal.isOpen && (
        <PowerDownModal
          isOpen={powerDownModal.isOpen}
          cancel={powerDownModal.cancel}
          onOpenChange={(isOpen) => setPowerDownModal({ isOpen: isOpen })}
        />
      )}

      <SModal
        isOpen={balanceDisclosure.isOpen}
        onOpenChange={balanceDisclosure.onOpenChange}
        title={() =>
          key && (
            <div className="flex flex-row items-center gap-2">
              {tokens[key].iconSrc && (
                <Image
                  alt=""
                  width={35}
                  height={35}
                  src={tokens[key].iconSrc}
                />
              )}
              {tokens[key]["title"]}
            </div>
          )
        }
        body={() =>
          key && (
            <div className=" text-sm text-default-600">
              {tokens[key].title === "STEEM POWER"
                ? steem_power_desc(username, t)
                : tokens[key]["description"]}
            </div>
          )
        }
      />
    </div>
  );
}
