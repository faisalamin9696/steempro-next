import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Alert } from "@heroui/alert";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { toast } from "sonner";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import {
  Shield,
  Globe,
  HardDrive,
  Percent,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface MyWitnessTabProps {
  witness: Witness;
  username: string;
}

const DISABLE_KEY = "STM1111111111111111111111111111111114T1Anm";

const MyWitnessTab = ({ witness, username }: MyWitnessTabProps) => {
  const t = useTranslations("Witnesses.myWitness");
  const [url, setUrl] = useState(witness.url);
  const [signingKey, setSigningKey] = useState(witness.signing_key);
  const [accountCreationFee, setAccountCreationFee] = useState(
    witness.props.account_creation_fee.split(" ")[0],
  );
  const [maximumBlockSize, setMaximumBlockSize] = useState(
    witness.props.maximum_block_size.toString(),
  );
  const [sbdInterestRate, setSbdInterestRate] = useState(
    (witness.props.sbd_interest_rate / 100).toString(),
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
        useKeychain,
      );

      toast.success(t("updateSuccess"));
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
                {t("title")}
              </h3>
              <p className="text-sm text-muted">
                {t("description")}
              </p>
            </div>
            <div className="flex items-center gap-3 self-end">
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
                {!isDisabled ? t("disable") : t("enable")}
              </Button>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                label={t("urlLabel")}
                placeholder="https://www.steempro.com/witness-category/@username/witness-thread"
                labelPlacement="outside"
                value={url}
                onValueChange={setUrl}
                startContent={<Globe size={18} className="text-muted" />}
              />
              <Input
                label={t("signingKeyLabel")}
                placeholder="STM..."
                labelPlacement="outside"
                value={signingKey}
                onValueChange={setSigningKey}
                classNames={{ description: "text-xs text-muted" }}
                startContent={<Shield size={18} className="text-muted" />}
                description={t("signingKeyDesc")}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("creationFeeLabel")}
                  placeholder="3.000"
                  labelPlacement="outside"
                  type="number"
                  value={accountCreationFee}
                  onValueChange={setAccountCreationFee}
                  endContent={<span className="text-xs text-muted">STEEM</span>}
                />
                <Input
                  label={t("interestRateLabel")}
                  placeholder="0.00"
                  labelPlacement="outside"
                  type="number"
                  value={sbdInterestRate}
                  onValueChange={setSbdInterestRate}
                  endContent={<Percent size={18} className="text-muted" />}
                />
              </div>
              <Input
                label={t("blockSizeLabel")}
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
            title={t("securityTitle")}
            classNames={{
              title: "font-semibold pb-2",
            }}
            description={t("securityDesc")}
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              color="primary"
              isLoading={isUpdating}
              onPress={() => handleUpdate()}
            >
              {t("updateProps")}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MyWitnessTab;
