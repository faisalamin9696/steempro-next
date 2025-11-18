import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { memo, useRef, useState } from "react";
import { FaAt, FaBurn, FaMinus, FaPlus, FaUsersCog } from "react-icons/fa";
import { MdAdd, MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { validate_account_name } from "@/utils/chainValidation";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import { Chip } from "@heroui/chip";
import { FaPencil } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { AppStrings } from "@/constants/AppStrings";
import { BsStarFill } from "react-icons/bs";
import SModal from "@/components/ui/SModal";
import { getSettings, updateSettings } from "@/utils/user";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { HiHeart } from "react-icons/hi2";

interface Props {
  onSelectBeneficiary?: (bene: Beneficiary) => void;
  beneficiaries: Beneficiary[];
  onRemove?: (bene: Beneficiary) => void;
  isDisabled?: boolean;
  favourites?: Beneficiary[];
  isComment?: boolean;
}

const steemFavourites = [
  { account: "null", weight: 500 },
  {
    account: "steempro.com",
    weight: 500,
    color: "success",
  },
];

export default memo(function BeneficiaryButton(props: Props) {
  const {
    onSelectBeneficiary,
    beneficiaries,
    onRemove,
    isDisabled,
    favourites,
    isComment,
  } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [username, setUsername] = useState("");
  const [weight, setWeight] = useState("");
  const [benePopup, setBenePopup] = useState(false);
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const dispatch = useAppDispatch();

  const uniqueFavEntries = [
    ...(favourites ?? []),
    ...steemFavourites,
    ...settings.favouriteBene,
  ].filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.account === item.account)
  );
  const uniqueFavourites = [...uniqueFavEntries];

  const availableBene = beneficiaries?.reduce((sum, cur) => {
    return (sum -= cur.weight / 100);
  }, 100);

  function handleAddBeneficiary(
    _username: string,
    _weight: string,
    skipClear?: boolean
  ) {
    _username = _username.trim().toLowerCase()?.replace("@", "");

    if (beneficiaries?.length >= 8) {
      toast.info("Can have at most 8 beneficiaries");
      return;
    }

    if (beneficiaries.some((bene) => bene.account === _username)) {
      toast.info("Beneficiary cannot be duplicate");
      return;
    }

    const weightValue = Number(_weight);

    if (
      !_weight ||
      isNaN(weightValue) ||
      weightValue < 1 ||
      weightValue > 100
    ) {
      toast.info("Beneficiary percentage must be from 1–100");
      return;
    }

    if (validate_account_name(_username)) {
      toast.info("Invalid username");
      // Cannot specify self as beneficiary
      return;
    }

    if (availableBene <= 0 || parseFloat(_weight) > availableBene) {
      toast.info("Beneficiary total percentage must be less than 100");
      return;
    }

    onSelectBeneficiary?.({
      account: _username,
      weight: parseFloat(_weight) * 100,
    });

    if (!skipClear) {
      setUsername("");
      setWeight("");
    }
  }

  function handleRemoveBeneficiary(bene: Beneficiary) {
    onRemove && onRemove(bene);
  }

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateWeight = (delta: number) => {
    setWeight((prev) => {
      let num = Number(prev) || 0;
      num += delta;

      // Wrap between 1 and 100
      if (num > 100) num = 1;
      if (num < 1) num = 100;

      return num.toString();
    });
  };

  const handleLongPress = (delta: number) => {
    intervalRef.current = setInterval(() => {
      updateWeight(delta);
    }, 200);
  };

  const stopLongPress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  function addToFavourite(bene: Beneficiary) {
    const existing = settings.favouriteBene || [];

    const updatedUsers = existing.some((u) => u.account === bene.account)
      ? existing.map((u) => (u.account === bene.account ? bene : u))
      : [...existing, bene];

    const newSettings: Setting = {
      ...settings,
      favouriteBene: updatedUsers,
    };

    const newSetting = updateSettings(newSettings);
    dispatch(updateSettingsHandler(newSetting));
  }

  function removeFromFavourite(account: string) {
    const existing = settings.favouriteBene || [];

    const updatedUsers = existing.filter((u) => u.account !== account);

    const newSettings: Setting = {
      ...settings,
      favouriteBene: updatedUsers,
    };

    const newSetting = updateSettings(newSettings);
    dispatch(updateSettingsHandler(newSetting));
  }

  return (
    <SModal
      triggerProps={{
        title: "Beneficiaries",
        size: "sm",
        isDisabled: isDisabled,
        color: "warning",
        startContent: <FaUsersCog size={20} />,
        radius: "lg",
        variant: "flat",
      }}
      buttonTitle={
        <>
          {beneficiaries && beneficiaries.length > 0
            ? beneficiaries.length
            : null}
        </>
      }
      isOpen={benePopup}
      onOpenChange={setBenePopup}
      modalProps={{
        scrollBehavior: "inside",
        hideCloseButton: true,
        size: "xl",
      }}
      title={() => (
        <div className="flex flex-row gap-4 items-center justify-between">
          <p>{"Beneficiaries"}</p>
          <Card
            shadow="sm"
            className="flex flex-row gap-1 rounded-full items-center text-sm  p-1 border border-default-500/20"
          >
            <SAvatar size="xs" username={loginInfo.name} />
            <div className="flex gap-2 items-center">
              <p>{loginInfo.name}</p>
              <p className="text-xs text-default-700">{availableBene}%</p>
            </div>
          </Card>
        </div>
      )}
      subTitle={() =>
        `Enter a user to auto-share rewards for this ${
          isComment ? "comment" : "post"
        }.`
      }
      body={() => (
        <form
          title="Beneficiaries"
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement)
            ) {
              e.preventDefault();
              handleAddBeneficiary(username, weight);
            }
          }}
        >
          <div className="py-4">
            <div className=" flex flex-col xs:flex-row items-end gap-2 1xs:gap-4 1xs:items-end 1xs:justify-between w-full">
              <div className="flex flex-row gap-2 items-start w-full">
                <Input
                  classNames={{ label: "text-default-900/80" }}
                  autoCapitalize="off"
                  labelPlacement="outside"
                  label={"Username"}
                  placeholder="Account"
                  onValueChange={setUsername}
                  startContent={<FaAt className="text-default-600" />}
                  variant="flat"
                  value={username}
                  spellCheck="false"
                  size="sm"
                  isClearable
                />

                <div className="flex flex-col gap-[6px]">
                  <p className="text-xs">Reward (%)</p>
                  <div className="flex flex-row gap-2 items-center">
                    <Button
                      size="sm"
                      isIconOnly
                      onMouseDown={() => handleLongPress(-1)}
                      onMouseUp={stopLongPress}
                      onMouseLeave={stopLongPress}
                      onTouchStart={() => handleLongPress(-1)}
                      onTouchEnd={stopLongPress}
                      onPress={() => updateWeight(-1)}
                      className="transition"
                    >
                      <FaMinus />
                    </Button>

                    <p className="text-sm text-default-800 w-6 text-center">
                      {weight || "0"}
                    </p>

                    <Button
                      size="sm"
                      isIconOnly
                      onMouseDown={() => handleLongPress(1)}
                      onMouseUp={stopLongPress}
                      onMouseLeave={stopLongPress}
                      onTouchStart={() => handleLongPress(1)}
                      onTouchEnd={stopLongPress}
                      onPress={() => updateWeight(1)}
                      className="transition"
                    >
                      <FaPlus />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onPress={() => handleAddBeneficiary(username, weight)}
                color="success"
                variant="flat"
                size="sm"
                isDisabled={!!validate_account_name(username) || !weight}
              >
                Add
                <MdAdd size={28} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {beneficiaries?.map((item) => {
              const isExist = !!uniqueFavourites?.find(
                (bene) => bene.account === item.account
              );

              return (
                <Card
                  className="bg-foreground/5"
                  shadow="sm"
                  key={item.account}
                >
                  <CardBody>
                    <BeneficiaryItem
                      isExist={isExist}
                      beneficiary={item}
                      handleRemoveBeneficiary={handleRemoveBeneficiary}
                      handleAddFavourite={addToFavourite}
                      handleEditBeneficiary={(bene) => {
                        handleRemoveBeneficiary(bene);
                        setUsername(bene.account);
                        setWeight((bene.weight / 100).toString());
                      }}
                    />
                  </CardBody>
                </Card>
              );
            })}

            <Card className="flex flex-col gap-2 bg-default-100/10 p-2 mt-2">
              <p className="text-medium sm:text-lg font-semibold text-default-700">
                Favourites
              </p>
              <div className="flex flex-row flex-wrap gap-2 p-1">
                {uniqueFavourites.map((item) => {
                  const isExist = !!beneficiaries?.find(
                    (bene) => bene.account === item.account
                  );
                  return (
                    <Card
                      key={item.account}
                      shadow="sm"
                      isBlurred={isExist}
                      isPressable={
                        !beneficiaries?.find(
                          (bene) => bene.account === item.account
                        )
                      }
                      className={twMerge("bg-foreground/5 w-full 1xs:w-auto")}
                      onPress={() => {
                        handleAddBeneficiary(
                          item.account,
                          String(item.weight / 100),
                          true
                        );
                      }}
                    >
                      <CardBody>
                        <BeneficiaryItem
                          beneficiary={item}
                          isFavourite
                          handleRemoveFavourite={removeFromFavourite}
                        />
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>
        </form>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="light" onPress={onClose}>
          Cancel
        </Button>
      )}
    />
  );
});

export const BeneficiaryItem = ({
  beneficiary,
  isFavourite,
  handleRemoveBeneficiary,
  handleEditBeneficiary,
  handleAddFavourite,
  handleRemoveFavourite,
  isExist,
}: {
  beneficiary: Beneficiary;
  isFavourite?: boolean;
  handleRemoveBeneficiary?: (beneficiary: Beneficiary) => void;
  handleEditBeneficiary?: (beneficiary: Beneficiary) => void;
  handleAddFavourite?: (beneficiary: Beneficiary) => void;
  handleRemoveFavourite?: (account: string) => void;
  isExist?: boolean;
}) => {
  return (
    <div className="flex w-full" key={beneficiary.account}>
      <div className="flex flex-row gap-4 pe-2 w-full items-center rounded-full">
        <div className="flex flex-row gap-2 flex-1 items-center">
          {!isFavourite && (
            <SAvatar onlyImage size="xs" username={beneficiary.account} />
          )}
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2 items-center">
              <p>{beneficiary.account}</p>
              <p className=" font-mono text-sm">
                ({beneficiary.weight / 100}%)
              </p>
            </div>

            {isFavourite &&
              beneficiary.account !== AppStrings.official_account &&
              beneficiary.account !== "null" && (
                <Chip
                  onClick={() => {
                    handleRemoveFavourite?.(beneficiary.account);
                  }}
                  variant="flat"
                  color="danger"
                  size="sm"
                  className="cursor-pointer z-10 opacity-100 relative"
                >
                  <div className="flex flex-row text-tiny font-mono items-center gap-1">
                    <MdDelete /> Remove
                  </div>
                </Chip>
              )}
            {isFavourite && beneficiary.account === "null" && (
              <Chip variant="flat" color="warning" size="sm" className="">
                <div className="flex flex-row text-tiny font-mono items-center gap-1">
                  <FaBurn /> Burn steem
                </div>
              </Chip>
            )}

            {isFavourite &&
              beneficiary.account === AppStrings.official_account && (
                <Chip variant="flat" color="success" size="sm" className="">
                  <div className="flex flex-row text-tiny font-mono items-center gap-1">
                    <BsStarFill /> Official
                  </div>
                </Chip>
              )}
          </div>
        </div>

        {!isExist && !isFavourite && (
          <Button
            onPress={() => handleAddFavourite?.(beneficiary)}
            variant="flat"
            size="sm"
            isIconOnly
          >
            <HiHeart size={18} />
          </Button>
        )}

        {!isFavourite && (
          <Button
            onPress={() => handleEditBeneficiary?.(beneficiary)}
            variant="flat"
            size="sm"
            isIconOnly
          >
            <FaPencil size={18} />
          </Button>
        )}

        {!isFavourite && (
          <Button
            variant="flat"
            color="danger"
            size="sm"
            onPress={() => {
              handleRemoveBeneficiary?.(beneficiary);
            }}
            isIconOnly
          >
            <MdDelete size={24} />
          </Button>
        )}
      </div>
    </div>
  );
};
