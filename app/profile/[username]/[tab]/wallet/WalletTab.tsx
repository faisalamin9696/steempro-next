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

const WalletTab = ({ account }: { account: AccountExt }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [showPowerDownModal, setShowPowerDownModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const { data: session } = useSession();

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
                  target ? { delegatee: target, amount: "" } : undefined
                );
                setShowDelegationModal(true);
              }}
              expiringCount={account.expiring_delegations?.length}
            />

            {/* Tabs for History and Delegations */}
            <div>
              <Tabs
                fullWidth
                defaultSelectedKey="history"
                className="w-full"
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
    </div>
  );
};

export default WalletTab;
