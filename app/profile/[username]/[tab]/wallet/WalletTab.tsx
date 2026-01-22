import { useState } from "react";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { PowerDownStatus } from "@/components/wallet/PowerDownStatus";
import { PendingRewards } from "@/components/wallet/PendingRewards";
import { TransferModal } from "@/components/wallet/TransferModal";
import { PowerUpModal } from "@/components/wallet/PowerUpModal";
import { PowerDownModal } from "@/components/wallet/PowerDownModal";
import { WalletHistory } from "@/components/wallet/WalletHistory";
import { Delegations } from "@/components/wallet/Delegations";
import { Tab, Tabs } from "@heroui/tabs";
import { DelegationModal } from "@/components/wallet/DelegationModal";
import { useSession } from "next-auth/react";
import { AccountRecoveryStatus } from "@/components/wallet/AccountRecoveryStatus";
import { ConversionStatus } from "@/components/wallet/ConversionStatus";
import OpenOrdersTable from "@/components/market/OpenOrdersTable";
import { sdsApi } from "@/libs/sds";
import useSWR from "swr";
import SCard from "@/components/ui/SCard";
import { Plus } from "lucide-react";
import { Button } from "@heroui/button";
import Link from "next/link";
import { WithdrawSavingsModal } from "@/components/wallet/WithdrawSavingsModal";

const WalletTab = ({ account }: { account: AccountExt }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [showPowerDownModal, setShowPowerDownModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [showWithdrawSavingsModal, setShowWithdrawSavingsModal] =
    useState(false);
  const [withdrawSavingsCurrency, setWithdrawSavingsCurrency] = useState<
    "STEEM" | "SBD"
  >("STEEM");

  const { data: session } = useSession();
  const isMe = account.name === session?.user?.name;

  const { data: openOrders, mutate: mutateOrders } = useSWR(
    isMe ? `market-open-orders-${session?.user?.name!}` : null,
    () => sdsApi.getOpenOrders(session?.user?.name!),
    { refreshInterval: 15000 },
  );

  const [initialTransferRecipient, setInitialTransferRecipient] = useState<
    string | undefined
  >(undefined);
  const [initialPowerUpRecipient, setInitialPowerUpRecipient] = useState<
    string | undefined
  >(undefined);
  const [initialDelegationData, setInitialDelegationData] = useState<
    { delegatee: string; amount: string } | undefined
  >(undefined);

  const getTarget = () =>
    account.name === session?.user?.name ? undefined : account.name;

  return (
    <div>
      <div>
        {account && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Top Section: Status Cards */}

            <div className="flex flex-col gap-4">
              <AccountRecoveryStatus account={account} />
              <ConversionStatus account={account} />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(auto,1fr))] gap-4">
                <PowerDownStatus account={account} />
                <PendingRewards account={account} />
              </div>
            </div>

            {/* Balance and Actions */}
            <BalanceCard
              account={account}
              onTransfer={() => {
                setInitialTransferRecipient(getTarget());
                setShowTransferModal(true);
              }}
              onPowerUp={() => {
                setInitialPowerUpRecipient(getTarget());
                setShowPowerUpModal(true);
              }}
              onPowerDown={() => setShowPowerDownModal(true)}
              onDelegate={() => {
                const target = getTarget();
                setInitialDelegationData(
                  target ? { delegatee: target, amount: "" } : undefined,
                );
                setShowDelegationModal(true);
              }}
              onWithdrawSavings={(currency) => {
                setWithdrawSavingsCurrency(currency);
                setShowWithdrawSavingsModal(true);
              }}
              expiringCount={account.expiring_delegations?.length}
            />

            {/* Tabs for History and Delegations */}
            <div>
              <Tabs
                defaultSelectedKey="history"
                className="w-full"
                color="secondary"
                classNames={{
                  panel: "px-0",
                }}
              >
                <Tab key={"history"} title="Transaction History">
                  <WalletHistory username={account.name} />
                </Tab>

                <Tab key={"delegations"} title="Delegations">
                  <Delegations account={account} />
                </Tab>

                {isMe && (
                  <Tab key={"orders"} title="Orders">
                    <SCard
                      title={`Orders (${openOrders?.length})`}
                      icon={Plus}
                      iconClass="p-2 rounded-lg bg-primary/10 border border-primary/20"
                      titleClass="font-semibold"
                      classNames={{ body: "gap-4" }}
                      className="card"
                      iconSize="sm"
                      description={"Your open orders"}
                      titleEndContent={
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          as={Link}
                          href="/market"
                        >
                          <Plus />
                          New Order
                        </Button>
                      }
                    >
                      <OpenOrdersTable
                        orders={openOrders}
                        onUpdate={mutateOrders}
                      />
                    </SCard>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransferModal
        isOpen={showTransferModal}
        onOpenChange={setShowTransferModal}
        initialRecipient={initialTransferRecipient}
      />

      <PowerUpModal
        isOpen={showPowerUpModal}
        onOpenChange={setShowPowerUpModal}
        initialRecipient={initialPowerUpRecipient}
      />

      <PowerDownModal
        isOpen={showPowerDownModal}
        onOpenChange={setShowPowerDownModal}
      />

      <DelegationModal
        isOpen={showDelegationModal}
        onOpenChange={setShowDelegationModal}
        outgoingDelegations={account.outgoing_delegations}
        initialData={initialDelegationData}
      />

      <WithdrawSavingsModal
        isOpen={showWithdrawSavingsModal}
        onOpenChange={setShowWithdrawSavingsModal}
        initialCurrency={withdrawSavingsCurrency}
      />
    </div>
  );
};

export default WalletTab;
