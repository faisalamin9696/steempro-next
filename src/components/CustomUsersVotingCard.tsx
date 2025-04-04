import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import React, { useState } from "react";
import IconButton from "./IconButton";
import { MdAdd, MdClose } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { getSettings, updateSettings } from "@/libs/utils/user";
import SAvatar from "./SAvatar";
import { toast } from "sonner";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { secureDecrypt } from "@/libs/utils/encryption";

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

  function handleRemveUser(user: {
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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className=" mt-4"
      scrollBehavior="inside"
      backdrop="blur"
      size="md"
      hideCloseButton
      placement="top"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <p>Users</p>
              <p className=" opacity-disabled text-xs">
                Set vote weight for a user (Only for LongPress voting)
              </p>
            </ModalHeader>
            <ModalBody id="scrollDiv" className=" pb-4">
              <div className="my-4 flex flex-col gap-6">
                <div className=" flex gap-2 items-end w-full">
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddUser();
                      }
                    }}
                  />

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
                    maxLength={3}
                    errorMessage="Invalid value"
                    type="number"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-900/80 text-small">
                          %
                        </span>
                      </div>
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddUser();
                      }
                    }}
                  />

                  <IconButton
                    className="mt-6 rounded-md"
                    color="success"
                    variant="flat"
                    size="sm"
                    IconType={MdAdd}
                    onPress={handleAddUser}
                    iconClassName="text-xl"
                  />

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

                <div
                  className="flex-col space-y-2 md:space-y-0 md:grid md:grid-flow-row md:grid-cols-2 
                            gap-2 md:gap-4 "
                >
                  {settings.longPressVote.usersList?.map((user) => {
                    return (
                      <div className="flex w-full" key={user.name}>
                        <Card className="gap-2 w-full flex-row items-center rounded-full comment-card ">
                          <SAvatar size="xs" username={user.name} />
                          <div className="flex gap-2 flex-1 items-center">
                            <p>{user.name}</p>
                            <p className=" text-sm">{user.weight}%</p>
                          </div>
                          <IconButton
                            className="bg-red-400  
                                            min-w-0 !w-5 !h-5"
                            IconType={MdClose}
                            size="sm"
                            onPress={() => {
                              handleRemveUser(user);
                            }}
                            iconClassName="text-white"
                          />
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose} size="sm">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default CustomUsersVotingCard;
