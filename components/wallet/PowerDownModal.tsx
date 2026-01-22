import { useState } from "react";
import { ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import {  Checkbox } from "@heroui/checkbox";
import { Alert } from "@heroui/alert";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import moment from "moment";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useAccountsContext } from "../auth/AccountsContext";
import { Plus, Trash2 } from "lucide-react";
import useSWR from "swr";
import { client } from "@/libs/steem";
import SInput from "../ui/SInput";
import SUsername from "../ui/SUsername";

interface PowerDownModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const PowerDownModal = ({
  isOpen,
  onOpenChange,
}: PowerDownModalProps) => {
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const { vests_own, vests_out, powerdown, powerdown_done } = loginData;
  const [amount, setAmount] = useState("");
  const { vestsToSteem, steemToVests } = useSteemUtils();
  const availableSp = vestsToSteem(
    vests_own - vests_out - powerdown + powerdown_done
  );
  const [confirm, setConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { authenticateOperation } = useAccountsContext();

  /** Routes State */
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeAccount, setRouteAccount] = useState("");
  const [routePercent, setRoutePercent] = useState("");
  const [autoVest, setAutoVest] = useState(false);
  const [isRoutePending, setIsRoutePending] = useState(false);

  const { data: routes, mutate: mutateRoutes } = useSWR(
    isOpen ? ["withdraw_routes", loginData.name] : null,
    async () => {
      return await client.call("condenser_api", "get_withdraw_routes", [
        loginData.name,
        "all",
      ]);
    }
  );

  const handleAddRoute = async () => {
    setIsRoutePending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.setWithdrawVestingRoute(
        loginData.name,
        routeAccount,
        Number(routePercent),
        autoVest,
        key,
        useKeychain
      );
      toast.success("Route Added", {
        description: `Successfully set withdrawal route to @${routeAccount}`,
      });
      setShowRouteForm(false);
      setRouteAccount("");
      setRoutePercent("");
      mutateRoutes();
    }).finally(() => {
      setIsRoutePending(false);
    });
  };

  const handleRemoveRoute = async (target: string) => {
    setIsRoutePending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.setWithdrawVestingRoute(
        loginData.name,
        target,
        0,
        false,
        key,
        useKeychain
      );
      toast.success("Route Removed", {
        description: `Withdrawal route to @${target} has been removed`,
      });
      mutateRoutes();
    }).finally(() => {
      setIsRoutePending(false);
    });
  };

  const handlePowerDown = async () => {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.powerDown(
        session?.user?.name!,
        steemToVests(amount),
        key,
        useKeychain
      );

      dispatch(
        addLoginHandler({
          ...loginData,
          powerdown: steemToVests(amount),
          next_powerdown: moment().add(7, "days").unix(),
          powerdown_rate: steemToVests(amount) / 4,
        })
      );

      toast.success("Power Down Initiated", {
        description: `Starting power down of ${amount} STEEM`,
      });
      onOpenChange(false);
      setConfirm(false);
    }).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <SModal
      isOpen={isOpen}
      hideCloseButton={isPending}
      onOpenChange={onOpenChange}
      isDismissable={!isPending}
      title={() => (
        <div className="flex flex-row gap-2 items-center">
          <ArrowDownLeft size={20} className="text-warning" />
          <p>Power Down STEEM</p>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col gap-4 py-4">
          <Card
            fullWidth
            isPressable
            shadow="none"
            className="p-4 rounded-lg bg-warning/10 border border-warning-200"
            isDisabled={isPending}
            onPress={() => {
              setAmount(availableSp.toFixed(3));
            }}
          >
            <p className="text-sm text-muted mb-1">Available Steem Power</p>
            <p className="text-2xl font-bold">{availableSp.toLocaleString()}</p>
          </Card>

          <Input
            id="powerdown-amount"
            type="number"
            step="0.001"
            placeholder="0.000"
            label="Amount (STEEM)"
            labelPlacement="outside-top"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            isDisabled={isPending}
            min={0.001}
          />

          {!!powerdown && (
            <Alert
              variant="faded"
              color="primary"
              classNames={{
                description: "text-sm",
                title: "pb-1 font-semibold",
              }}
              title="Active Power Down"
              description={
                <ul className="list-disc list-inside space-y-1 text-muted">
                  <li>
                    Powering down {vestsToSteem(powerdown).toLocaleString()} (
                    {vestsToSteem(powerdown_done).toLocaleString()} paid)
                  </li>
                  <li>
                    {vestsToSteem(vests_out).toLocaleString()} STEEM delegated
                    (locked)
                  </li>
                  <li>Changing power down resets the schedule</li>
                </ul>
              }
            />
          )}

          <Alert
            variant="faded"
            title="Important Information"
            color="warning"
            classNames={{ description: "text-sm", title: "pb-1 font-semibold" }}
            description={
              <ul className="list-disc list-inside space-y-1 text-muted">
                <li>Power down takes 4 weeks to complete</li>
                <li>You'll receive equal payments each week</li>
                <li>You can cancel anytime before completion</li>
                <li>During power down, your voting power decreases</li>
              </ul>
            }
          />

          {availableSp - Number(amount) < 5 && (
            <Alert
              variant="flat"
              color="danger"
              classNames={{
                description: "text-sm",
                title: "pb-1 font-semibold",
              }}
              title="Unusable State"
              description={
                <p>
                  Maintain at least 5 STEEM POWER to keep your account
                  functional
                </p>
              }
            />
          )}

          <Checkbox
            isSelected={confirm}
            onValueChange={setConfirm}
            isDisabled={isPending}
          >
            Confirm Power Down
          </Checkbox>

          <Button
            onPress={handlePowerDown}
            className="w-full"
            color="warning"
            variant="flat"
            isDisabled={!confirm || !amount || parseFloat(amount) <= 0}
            isLoading={isPending}
          >
            Start Power Down
          </Button>

          <Divider />

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Withdraw Routes</p>
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                startContent={<Plus size={16} />}
                onPress={() => setShowRouteForm(!showRouteForm)}
              >
                {showRouteForm ? "Cancel" : "Add Route"}
              </Button>
            </div>

            {showRouteForm && (
              <div className="flex flex-col gap-3 p-3 border border-divider rounded-lg">
                <Input
                  label="Target Account"
                  size="sm"
                  placeholder="Username"
                  value={routeAccount}
                  onChange={(e) =>
                    setRouteAccount(e.target.value.toLowerCase().trim())
                  }
                />
                <div className="flex gap-2 items-end">
                  <SInput
                    label="Percentage"
                    size="sm"
                    type="number"
                    placeholder="0-100"
                    className="flex-1"
                    value={routePercent}
                    onChange={(e) => setRoutePercent(e.target.value)}
                    endContent={<span className="text-xs">%</span>}
                  />
                  <div className="flex flex-col gap-1 pb-1 items-center">
                    <span className="text-[10px] text-muted">Auto Vest</span>
                    <Checkbox
                      isSelected={autoVest}
                      onValueChange={setAutoVest}
                      size="sm"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  color="secondary"
                  onPress={handleAddRoute}
                  isLoading={isRoutePending}
                  isDisabled={!routeAccount || !routePercent}
                >
                  Set Route
                </Button>
              </div>
            )}

            {routes && routes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {routes.map((route: any) => (
                  <div
                    key={route.to_account}
                    className="flex justify-between items-center p-4 py-2 rounded-xl bg-default-50 border border-divider text-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <SUsername
                        className="font-semibold"
                        username={`@${route.to_account}`}
                      />
                      <span className="text-muted">
                        {route.percent / 100}%{" "}
                        {route.auto_vest ? "(Power Up)" : "(Liquid)"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => handleRemoveRoute(route.to_account)}
                      isLoading={isRoutePending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-2">
                No active withdrawal routes
              </p>
            )}
          </div>
        </div>
      )}
    </SModal>
  );
};
