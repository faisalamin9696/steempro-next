"use client";

import React from "react";
import {
  FaCalendarAlt,
  FaInfoCircle,
  FaTools,
  FaUserCircle,
} from "react-icons/fa";
import { Button } from "@nextui-org/button";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from "../../auth/AuthProvider";
import Link from "next/link";
import { PiUserSwitchFill } from "react-icons/pi";
import { RiUserStarFill } from "react-icons/ri";
import { HiMiniUserGroup } from "react-icons/hi2";
import { MdPrivacyTip } from "react-icons/md";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { BsGithub } from "react-icons/bs";
import { GitHubLink } from "@/libs/constants/AppConstants";

interface Props {
  onItemClick?: () => void;
  onAccountSwitch?: () => void;
  handleLogout: () => void;
}
export default function DrawerItems(props: Props) {
  const { onItemClick, onAccountSwitch, handleLogout } = props;
  const { isLogin, authenticateUser, isAuthorized } = useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between overflow-y-auto scrollbar-thin">
      <>
        <div className="flex flex-col gap-2 h-full text-default-600">
          {isLogin() && (
            <Accordion isCompact defaultExpandedKeys={["user"]}>
              <AccordionItem
                key="user"
                aria-label="User"
                title="User"
                classNames={{ title: " text-sm text-default-600" }}
              >
                <div className=" flex flex-col">
                  <Button
                    className="w-full justify-start text-inherit "
                    variant="light"
                    as={Link}
                    href={`/@${loginInfo.name}`}
                    onPress={onItemClick}
                    startContent={<FaUserCircle className="text-xl" />}
                  >
                    Profile
                  </Button>

                  <Button
                    className="w-full justify-start text-inherit "
                    variant="light"
                    as={Link}
                    href={`/schedules`}
                    onPress={onItemClick}
                    startContent={<FaCalendarAlt className="text-xl" />}
                  >
                    Schedules
                  </Button>

                  <Button
                    className="w-full justify-start text-inherit "
                    variant="light"
                    onPress={() => {
                      onAccountSwitch && onAccountSwitch();
                      onItemClick && onItemClick();
                    }}
                    startContent={<PiUserSwitchFill className="text-xl" />}
                  >
                    Switch/Add
                  </Button>

                  <Button
                    className="w-full justify-start text-danger "
                    variant="light"
                    color="danger"
                    onPress={() => {
                      handleLogout();
                    }}
                    startContent={
                      <IoLogOut className="text-xl text-default-600" />
                    }
                  >
                    Logout
                  </Button>
                </div>
              </AccordionItem>
            </Accordion>
          )}

          <Accordion isCompact defaultExpandedKeys={["explore"]}>
            <AccordionItem
              key="explore"
              aria-label="Explore"
              title="Explore"
              classNames={{ title: " text-sm text-default-600" }}
            >
              <div className=" flex flex-col">
                <Button
                  variant="light"
                  className="w-full justify-start text-inherit "
                  as={Link}
                  href={`/communities`}
                  onPress={onItemClick}
                  startContent={<HiMiniUserGroup className="text-xl" />}
                >
                  Communities
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start text-inherit "
                  as={Link}
                  href={`/witnesses`}
                  onPress={onItemClick}
                  startContent={<RiUserStarFill className="text-xl" />}
                >
                  Witnesses
                </Button>

                <Button
                  variant="light"
                  as={Link}
                  href={`/settings`}
                  className="w-full justify-start text-inherit "
                  onPress={onItemClick}
                  startContent={<IoMdSettings className="text-xl" />}
                >
                  Settings
                </Button>

                <Button
                  variant="light"
                  as={Link}
                  href="/tools"
                  className="w-full justify-start text-inherit "
                  onPress={onItemClick}
                  startContent={<FaTools className="text-xl" />}
                >
                  Tools
                </Button>
              </div>
            </AccordionItem>
          </Accordion>

          <Accordion isCompact defaultExpandedKeys={["contact"]}>
            <AccordionItem
              key="contact"
              aria-label="Contact"
              title="Contact"
              classNames={{ title: " text-sm text-default-600" }}
            >
              <div className=" flex flex-col">
                <Button
                  variant="light"
                  className="w-full justify-start text-inherit "
                  as={Link}
                  href={`/policy`}
                  onPress={onItemClick}
                  startContent={<MdPrivacyTip className="text-xl" />}
                >
                  Privacy Policy
                </Button>

                <Button
                  variant="light"
                  className="w-full justify-start text-inherit "
                  as={Link}
                  target="_blank"
                  href={GitHubLink}
                  onPress={onItemClick}
                  startContent={<BsGithub className="text-xl" />}
                >
                  GitHub
                </Button>

                <Button
                  variant="light"
                  className="w-full justify-start text-inherit "
                  as={Link}
                  href={"/about"}
                  onPress={onItemClick}
                  startContent={<FaInfoCircle className="text-xl" />}
                >
                  About
                </Button>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </>
    </div>
  );
}
