import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Switch,
  Divider,
  Alert,
} from "@heroui/react";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { toast } from "sonner";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import {
  Shield,
  Globe,
  HardDrive,
  Percent,
  LogOut,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MyWitnessTabProps {
  witness: Witness;
  username: string;
}

const DISABLE_KEY = "STM1111111111111111111111111111111114T1Anm";

const MyWitnessTab = ({ witness, username }: MyWitnessTabProps) => {
  const [url, setUrl] = useState(witness.url);
  const [signingKey, setSigningKey] = useState(witness.signing_key);
  const [accountCreationFee, setAccountCreationFee] = useState(
    witness.props.account_creation_fee.split(" ")[0]
  );
  const [maximumBlockSize, setMaximumBlockSize] = useState(
    witness.props.maximum_block_size.toString()
  );
  const [sbdInterestRate, setSbdInterestRate] = useState(
    (witness.props.sbd_interest_rate / 100).toString()
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { authenticateOperation } = useAccountsContext();

  const handleUpdate = async (customSigningKey?: string) => {
    setIsUpdating(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");

      const targetSigningKey = customSigningKey ?? signingKey;

      const props = {
        account_creation_fee:
          parseFloat(accountCreationFee).toFixed(3) + " STEEM",
        maximum_block_size: parseInt(maximumBlockSize),
        sbd_interest_rate: Math.floor(parseFloat(sbdInterestRate) * 100),
      };

      await steemApi.witnessUpdate(
        username,
        url,
        targetSigningKey,
        props,
        key,
        useKeychain
      );

      toast.success("Witness properties updated successfully");
      if (customSigningKey) setSigningKey(customSigningKey);
    }).finally(() => {
      setIsUpdating(false);
    });
  };

  const isDisabled = signingKey === DISABLE_KEY;

  const handleDisable = () => {
    handleUpdate(DISABLE_KEY);
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <Card className="card">
        <CardBody className="gap-6 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-primary" />
                Witness Settings
              </h3>
              <p className="text-sm text-muted">
                Manage your witness node properties and status.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isDisabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" size={14} />
              ) : (
                <XCircle className="h-4 w-4 text-warning ml-2" size={14} />
              )}
              <Button
                color={!isDisabled ? "danger" : "success"}
                variant="flat"
                size="sm"
                radius="full"
                onPress={!isDisabled ? handleDisable : () => {}}
                isDisabled={
                  isUpdating ||
                  (isDisabled &&
                    signingKey === DISABLE_KEY &&
                    witness.signing_key === DISABLE_KEY)
                }
              >
                {!isDisabled ? "Disable Witness" : "Enable Witness"}
              </Button>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                label="Witness URL"
                placeholder="https://steempro.com/witness-category/@username/witness-thread"
                labelPlacement="outside"
                value={url}
                onValueChange={setUrl}
                startContent={<Globe size={18} className="text-muted" />}
              />
              <Input
                label="Block Signing Key"
                placeholder="STM..."
                labelPlacement="outside"
                value={signingKey}
                onValueChange={setSigningKey}
                classNames={{ description: "text-xs text-muted" }}
                startContent={<Shield size={18} className="text-muted" />}
                description="The public key used to sign blocks."
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Account Creation Fee"
                  placeholder="3.000"
                  labelPlacement="outside"
                  type="number"
                  value={accountCreationFee}
                  onValueChange={setAccountCreationFee}
                  endContent={<span className="text-xs text-muted">STEEM</span>}
                />
                <Input
                  label="SBD Interest Rate"
                  placeholder="0.00"
                  labelPlacement="outside"
                  type="number"
                  value={sbdInterestRate}
                  onValueChange={setSbdInterestRate}
                  endContent={<Percent size={18} className="text-muted" />}
                />
              </div>
              <Input
                label="Maximum Block Size"
                placeholder="65536"
                labelPlacement="outside"
                type="number"
                value={maximumBlockSize}
                onValueChange={setMaximumBlockSize}
                startContent={<HardDrive size={18} className="text-muted" />}
              />
            </div>
          </div>

          <Alert
            color="warning"
            variant="faded"
            title="Signing Key Security"
            classNames={{
              title: "font-semibold pb-2",
            }}
            description="Changing your signing key requires active authority. Ensure you have the corresponding private key on your witness node before updating the public signing key, otherwise your node will miss blocks."
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              color="primary"
              isLoading={isUpdating}
              onPress={() => handleUpdate()}
            >
              Update Witness Props
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MyWitnessTab;
