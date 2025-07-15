import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import React, { useRef, useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { updateSettings } from "@/utils/user";
import SAvatar from "./ui/SAvatar";
import { toast } from "sonner";
import { validate_account_name } from "@/utils/chainValidation";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { secureDecrypt } from "@/utils/encryption";
import SModal from "./ui/SModal";
import { FaAt, FaMinus, FaPlus } from "react-icons/fa";
import { BeneficiaryItem } from "./editor/components/BeneficiaryButton";

const STORAGE_KEY = "@secure.j.settings";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
function CustomUsersVotingCard(props: Props) {
  const { isOpen, onOpenChange } = props;

  const settingssString = secureDecrypt(
    localStorage.getItem(STORAGE_KEY) ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );
  const settingsLocal = JSON.parse(settingssString || `{}`) as Setting;

  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? settingsLocal;
  let [username, setUsername] = useState("");
  let [weight, setWeight] = useState("");
  const dispatch = useAppDispatch();
  const users: {
    name: string;
    weight: number;
    community: string;
  }[] = settings.longPressVote.usersList;

  // const [community, setCommunity] = useState("");

  function clearForm() {
    setUsername("");
    setWeight("");
  }

  function handleAddUser() {
    username = username.trim().toLowerCase();

    if (users.some((user) => user.name === username)) {
      toast.info("User already added");
      return;
    }

    const weightValue = Number(weight);

    if (!weight || weightValue < 1 || weightValue > 100) {
      return toast.info("Vote weight must be from 1-100");
    }

    if (validate_account_name(username)) {
      toast.info("Invalid username");
      return;
    }

    const newUser = { name: username, community: "", weight: Number(weight) };

    const newSetting = updateSettings({
      ...settings,
      longPressVote: {
        ...settings.longPressVote,
        usersList: [...users, newUser],
      },
    });

    dispatch(updateSettingsHandler(newSetting));
    toast.success(`${username} added successfully`);
    clearForm();
  }

  function handleRemoveUser(user: {
    name: string;
    weight: number;
    community: string;
  }) {
    const newList = settings.longPressVote.usersList.filter(
      (item) => item.name !== user.name
    );

    const newSetting = updateSettings({
      ...settings,
      longPressVote: {
        ...settings.longPressVote,
        usersList: newList,
      },
    });

    dispatch(updateSettingsHandler(newSetting));
    toast.success(`${username} removed successfully`);
    clearForm();
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
  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        scrollBehavior: "inside",
        backdrop: "blur",
        hideCloseButton: true,
        size: "lg",
      }}
      title={() => "Users"}
      subTitle={() => `Set vote weight for a user (Only for LongPress voting)`}
      body={() => (
        <div className="my-4 flex flex-col gap-6">
          <div className=" flex flex-col xs:flex-row items-end gap-2 1xs:gap-4 1xs:items-end 1xs:justify-between w-full">
            <div className="flex flex-row gap-2 items-start w-full">
              <Input
                classNames={{ label: "text-default-900/80" }}
                className="w-[70%]"
                autoCapitalize="off"
                labelPlacement="outside"
                label={"Username"}
                placeholder="Account"
                startContent={<FaAt className="text-default-600" />}
                size="sm"
                onValueChange={setUsername}
                isClearable
                variant="flat"
                value={username}
                spellCheck="false"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddUser();
                  }
                }}
              />

              <div className="flex flex-col gap-1">
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
              onPress={handleAddUser}
              color="success"
              variant="flat"
              size="md"
            >
              Add
              <MdAdd size={28} />
            </Button>

            {/* <Input
                    classNames={{ label: "text-default-900/80" }}
                    className="w-[30%]"
                    autoCapitalize="off"
                    labelPlacement="outside"
                    label={"Community [optional]"}
                    size="sm"
                    onValueChange={setCommunity}
                    variant="flat"
                    value={community}
                  /> */}
          </div>

          <div className="flex flex-col gap-2">
            {settings.longPressVote.usersList?.map((user) => {
              return (
                <Card className="bg-foreground/5" shadow="sm" key={user.name}>
                  <CardBody>
                    <BeneficiaryItem
                      beneficiary={{
                        account: user.name,
                        weight: user.weight * 100,
                      }}
                      handleRemoveBeneficiary={() => handleRemoveUser(user)}
                      handleEditBeneficiary={(bene) => {
                        handleRemoveUser(user);
                        setUsername(bene.account);
                        setWeight((bene.weight / 100).toString());
                      }}
                    />
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="flat" onPress={onClose} size="sm">
          Close
        </Button>
      )}
    />
  );
}

export default CustomUsersVotingCard;
