"use client";

import React from "react";
import {
  FaCalendar,
  FaCalendarAlt,
  FaInfoCircle,
  FaTools,
  FaUserCircle,
} from "react-icons/fa";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { logoutHandler } from "@/libs/redux/reducers/LoginReducer";
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from "../../AuthProvider";
import Link from "next/link";
import { PiUserSwitchFill } from "react-icons/pi";
import { RiUserStarFill } from "react-icons/ri";
import {
  getCredentials,
  getSessionKey,
  removeCredentials,
} from "@/libs/utils/user";
import { toast } from "sonner";
import { HiMiniUserGroup } from "react-icons/hi2";
import { LuCalendarRange } from "react-icons/lu";
import { MdPrivacyTip } from "react-icons/md";

interface Props {
  onItemClick?: () => void;
  onAccountSwitch?: () => void;
}
export default function DrawerItems(props: Props) {
  const { onItemClick, onAccountSwitch } = props;
  const dispatch = useAppDispatch();
  const { isLogin, authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { isOpen, onOpenChange } = useDisclosure();

  function handleLogout() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }
    onOpenChange();
    removeCredentials(credentials);
    dispatch(logoutHandler());
    signOut();
    toast.success(`${credentials.username} logged out successfully`);
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between overflow-y-auto scrollbar-thin">
      <>
        <div className="flex flex-col gap-2 h-full text-default-600">
          {isLogin() && (
            <Button
              className="w-full justify-start text-inherit "
              variant="light"
              as={Link}
              href={`/@${loginInfo.name}`}
              onClick={onItemClick}
              startContent={<FaUserCircle className="text-xl" />}
            >
              Profile
            </Button>
          )}

          {isLogin() && (
            <Button
              className="w-full justify-start text-inherit "
              variant="light"
              as={Link}
              href={`/schedules`}
              onClick={onItemClick}
              startContent={<FaCalendarAlt className="text-xl" />}
            >
              Schedules
            </Button>
          )}

          {isLogin() && (
            <Button
              className="w-full justify-start text-inherit "
              variant="light"
              onClick={() => {
                onAccountSwitch && onAccountSwitch();
                onItemClick && onItemClick();
              }}
              startContent={<PiUserSwitchFill className="text-xl" />}
            >
              Switch Account
            </Button>
          )}
          <Button
            variant="light"
            as={Link}
            href={`/settings`}
            className="w-full justify-start text-inherit "
            onClick={onItemClick}
            startContent={<IoMdSettings className="text-xl" />}
          >
            Settings
          </Button>
          <Button
            variant="light"
            className="w-full justify-start text-inherit "
            as={Link}
            href={`/communities`}
            onClick={onItemClick}
            startContent={<HiMiniUserGroup className="text-xl" />}
          >
            Communities
          </Button>
          <Button
            variant="light"
            className="w-full justify-start text-inherit "
            as={Link}
            href={`/witnesses`}
            onClick={onItemClick}
            startContent={<RiUserStarFill className="text-xl" />}
          >
            Witnesses
          </Button>

          <Button
            variant="light"
            className="w-full justify-start text-inherit "
            as={Link}
            href={`/policy`}
            onClick={onItemClick}
            startContent={<MdPrivacyTip className="text-xl" />}
          >
            Privacy Policy
          </Button>
          <Button
            variant="light"
            as={Link}
            href="/tools"
            className="w-full justify-start text-inherit "
            onClick={onItemClick}
            startContent={<FaTools className="text-xl" />}
          >
            Tools
          </Button>
          <Button
            variant="light"
            className="w-full justify-start text-inherit "
            as={Link}
            href={"/about"}
            onClick={onItemClick}
            startContent={<FaInfoCircle className="text-xl" />}
          >
            About
          </Button>
          {isLogin() && (
            <Button
              className="w-full justify-start text-danger "
              variant="light"
              onClick={() => {
                authenticateUser();
                if (!isAuthorized()) {
                  return;
                }
                onOpenChange();
              }}
              startContent={<IoLogOut className="text-xl text-default-600" />}
            >
              Logout
            </Button>
          )}
        </div>
      </>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="sm"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmation
              </ModalHeader>
              <ModalBody>
                <p>Do you really want to logout {loginInfo.name}?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
