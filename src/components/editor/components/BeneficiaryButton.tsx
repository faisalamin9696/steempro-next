import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { memo, useState } from "react";
import { FaUsersCog } from "react-icons/fa";
import { MdAdd, MdClose } from "react-icons/md";
import IconButton from "../../IconButton";
import { toast } from "sonner";
import { validate_account_name } from "@/libs/utils/chainValidation";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import SAvatar from "@/components/SAvatar";
import { useDeviceInfo } from "@/libs/hooks/useDeviceInfo";

interface Props {
  onSelectBeneficiary?: (bene: Beneficiary) => void;
  beneficiaries: Beneficiary[];
  onRemove?: (bene: Beneficiary) => void;
  isDisabled?: boolean;
}

export default memo(function BeneficiaryButton(props: Props) {
  const { onSelectBeneficiary, beneficiaries, onRemove, isDisabled } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  let [username, setUsername] = useState("");
  const [weight, setWeight] = useState("");
  const [benePopup, setBenePopup] = useState(false);
  const { isMobile } = useDeviceInfo();

  const availableBene = beneficiaries?.reduce((sum, cur) => {
    return (sum -= cur.weight / 100);
  }, 100);

  function handleAddBeneficiary() {
    username = username.trim().toLowerCase();

    if (beneficiaries?.length >= 8) {
      toast.info("Can have at most 8 beneficiaries");
      return;
    }

    if (beneficiaries.some((bene) => bene.account === username)) {
      toast.info("Beneficiary cannot be duplicate");
      return;
    }

    const weightValue = Number(weight);

    if (!weight || weightValue < 1 || weightValue > 100) {
      toast.info("Beneficiary percentage must be from 1-100");
    }

    if (validate_account_name(username)) {
      toast.info("Invalid username");
      // Cannot specify self as beneficiary
      return;
    }

    if (availableBene <= 0 || parseFloat(weight) > availableBene) {
      toast.info("Beneficiary total percentage must be less than 100");
      return;
    }

    onSelectBeneficiary &&
      onSelectBeneficiary({
        account: username,
        weight: parseFloat(weight) * 100,
      });

    setUsername("");
  }

  function handleRemveBeneficiary(bene: Beneficiary) {
    onRemove && onRemove(bene);
  }

  return (
    <div title="Beneficiaries">
      <Popover
        isOpen={benePopup}
        onOpenChange={(open) => {
          setBenePopup(open);
        }}
        placement={"top-start"}
      >
        <PopoverTrigger>
          <Button
            title="Beneficiaries"
            size="sm"
            isDisabled={isDisabled}
            color="warning"
            startContent={<FaUsersCog className="text-xl" />}
            radius="lg"
            variant="flat"
          >
            {isMobile ? "" : "Bene:"} {beneficiaries?.length ?? 0}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">
            <div className="flex sm:items-start justify-between gap-2 max-sm:flex-col">
              <div className=" flex max-sm:justify-between max-sm:w-full">
                <div className="space-y-1">
                  <p className="flex text-small font-bold">{"Beneficiaries"}</p>
                  <p className="text-default-900/60 text-tiny">
                    {"Who should receive any rewards?"}
                  </p>
                </div>

                <button
                  className="hidden max-sm:block items-center p-2"
                  onClick={() => {
                    setBenePopup(false);
                  }}
                >
                  <MdClose />
                </button>
              </div>

              <Card
                className="pe-2 gap-1 flex-row bg-secondary-800/10 max-sm:self-start
                        items-center rounded-full justify-start"
              >
                <SAvatar size="xs" username={loginInfo.name} />
                <div className="flex gap-2 flex-1">
                  <p>{loginInfo.name}</p>
                  <p className=" font-semibold">{availableBene}%</p>
                </div>
              </Card>
            </div>

            <div className="my-4 flex gap-2 md:items-center max-sm:items-end">
              <div className=" flex gap-2 md:items-center w-full">
                <Input
                  className="w-[30%]"
                  classNames={{ label: "text-default-900/80" }}
                  labelPlacement="outside"
                  label={"Weight"}
                  size="sm"
                  onValueChange={setWeight}
                  value={weight}
                  variant="flat"
                  max={100}
                  min={1}
                  type="number"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-900/80 text-small">%</span>
                    </div>
                  }
                />

                <Input
                  classNames={{ label: "text-default-900/80" }}
                  className="w-[70%]"
                  autoCapitalize="off"
                  labelPlacement="outside"
                  label={"Username"}
                  size="sm"
                  onValueChange={setUsername}
                  variant="flat"
                  value={username}
                  spellCheck="false"
                />
              </div>
              <IconButton
                className="mt-6 rounded-md"
                color="success"
                variant="flat"
                size="sm"
                IconType={MdAdd}
                onPress={handleAddBeneficiary}
                iconClassName="text-xl"
              />
            </div>
            <div
              className="flex-col space-y-2 md:space-y-0 md:grid md:grid-flow-row md:grid-cols-2 
                            gap-2 md:gap-4 "
            >
              {beneficiaries?.map((bene) => {
                return (
                  <div className="flex  w-full" key={bene.account}>
                    <Card
                      className="gap-4 pe-2 w-full
                                         flex-row items-center rounded-full"
                    >
                      <SAvatar size="xs" username={bene.account} />
                      <div className="flex space-x-2 flex-1">
                        <p>{bene.account}</p>
                        <p>{bene.weight / 100}%</p>
                      </div>
                      <div>
                        <IconButton
                          className="bg-red-400  
                                            min-w-0 !w-5 !h-5"
                          IconType={MdClose}
                          size="sm"
                          onPress={() => {
                            handleRemveBeneficiary(bene);
                          }}
                          iconClassName="text-white"
                        />
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
