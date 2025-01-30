"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React, { useEffect, useState } from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import CommunityTrendingsTab from "../(tabs)/trendings/page";
import CommunityCreatedTab from "../(tabs)/created/page";
import { CommunityAboutTab } from "../(tabs)/about/CommunityAboutTab";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { MdInfo, MdNewLabel, MdPin } from "react-icons/md";
import { FaFire } from "react-icons/fa";
import CommunityPinnedTab from "../(tabs)/pinned/page";
import CommunityMembers from "@/components/community/CommunityMembers";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

interface Props {
  data: Community;
}

export default function CommunityPage(props: Props) {
  const { data } = props;
  let { community, category } = usePathnameClient();
  const { isMobile, isBetween920AndMobile } = useDeviceInfo();
  const [membersModal, setMembersModal] = useState(false);

  const communityTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CommunityTrendingsTab />,
      icon: <FaFire size={24} />,
      priority: 1,
    },
    {
      title: "New",
      key: "created",
      children: <CommunityCreatedTab />,
      icon: <MdNewLabel size={24} />,
      priority: 2,
    },
  ];
  if (isMobile) {
    communityTabs.push({
      title: "Pinned",
      key: "pinned",
      children: <CommunityPinnedTab />,
      icon: <MdPin size={24} />,
      priority: 3,
    });
  }

  if (isBetween920AndMobile) {
    communityTabs.push({
      title: "About",
      key: "about",
      children: <CommunityAboutTab community={data} />,
      icon: <MdInfo size={24} />,
      priority: 5,
    });
  }
  const sortedCommunityTabs = communityTabs.sort(
    (a, b) => a.priority - b.priority
  );

  useEffect(() => {
    if (category === "roles") {
      setMembersModal(!membersModal);
    }
  }, []);

  return (
    <div>
      <div className="relative items-center flex-row w-full">
        <Tabs
          destroyInactiveTabPanel={false}
          size={"sm"}
          disableAnimation={isMobile}
          color={"secondary"}
          radius={isMobile ? "full" : "sm"}
          className="justify-center"
          defaultSelectedKey={category ?? "trending"}
          selectedKey={`/${category}/${community}`}
          classNames={{
            tabList: "max-sm:gap-0 main-tab-list",
            panel: "w-full",
            tabContent: " w-full",
          }}
        >
          {sortedCommunityTabs.map((tab) => (
            <Tab
              href={`/${tab.key}/${community}`}
              key={`/${tab.key}/${community}`}
              title={
                <div className="flex items-center space-x-2">
                  {!isMobile && tab?.icon}
                  <span>{tab.title}</span>
                </div>
              }
            >
              {tab.children}
            </Tab>
          ))}
        </Tabs>
        {!["about", "roles"].includes(category) && (
          <div className="absolute  top-0 right-0 max-sm:hidden">
            <FeedPatternSwitch />
          </div>
        )}
      </div>
      {membersModal && (
        <Modal
          isOpen={membersModal}
          onOpenChange={setMembersModal}
          placement="top-center"
          scrollBehavior="inside"
          closeButton
          onClose={() => {
            history.replaceState({}, "", `/${"trending"}/${community}`);
          }}
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {"Members"}
                </ModalHeader>
                <ModalBody>
                  <CommunityMembers community={data} />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
