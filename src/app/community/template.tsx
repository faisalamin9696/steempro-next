"use client";

import { getAccountExt, getCommunity } from "@/libs/steem/sds";
import MainWrapper from "@/components/wrappers/MainWrapper";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";
import CommunityCarousel from "@/components/carousal/CommunityCarousal";
import CommunityHeader from "@/components/CommunityHeader";
import CommunityInfoCard from "@/components/CommunityInfoCard";
import CommunityPage from "./(site)/CommunityPage";
import useSWR from "swr";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import CommunityChatModal from "@/components/chat/community/CommunityChatModal";
import { toast } from "sonner";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import CommunityMembers from "@/components/community/CommunityMembers";

export default function Template() {
  const { category, community } = usePathnameClient();
  const { data: session } = useSession();
  const chatDisclosure = useDisclosure();
  const leadershipDisclosure = useDisclosure();

  const { data, isLoading, error } = useSWR(
    community ? [`community-${community}`, session?.user?.name] : null,
    () =>
      Promise.all([
        getCommunity(community, session?.user?.name || "null"),
        getAccountExt(community, session?.user?.name || "null"),
      ])
  );

  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      data?.[0]?.account ?? ""
    ] ?? data?.[0];

  if (isLoading) return <LoadingCard />;
  if (error || !data) return <ErrorCard message={error?.message} />;

  function handleChatPress() {
    if (data && data[0]) {
      if (communityInfo && communityInfo.observer_subscribed) {
        chatDisclosure.onOpen();
      } else toast.info("Join to chat with the community!");
    }
  }
  return (
    <div>
      <MainWrapper
        endClassName="overflow-y-scroll max-h-screen min-w-[320px] w-[320px] pb-10"
        endContent={
          <CommunityInfoCard
            onLeadershipPress={leadershipDisclosure.onOpen}
            onChatPress={handleChatPress}
            key={Math.random()}
            community={data[0]}
          />
        }
      >
        <CommunityHeader
          onChatPress={handleChatPress}
          community={data[0]}
          account={data[1]}
          onLeadershipPress={leadershipDisclosure.onOpen}
        />
        <CommunityCarousel className="mt-2 max-1md:mt-8" />

        <CommunityPage
          onLeadershipPress={leadershipDisclosure.onOpen}
          data={data[0]}
        />
      </MainWrapper>
      {chatDisclosure.isOpen && (
        <CommunityChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          community={data[0]}
        />
      )}

      {leadershipDisclosure.isOpen && (
        <Modal
          isOpen={leadershipDisclosure.isOpen}
          onOpenChange={leadershipDisclosure.onOpenChange}
          placement="top-center"
          scrollBehavior="inside"
          closeButton
          onClose={() => {
            if (category === "roles")
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
                  <CommunityMembers community={communityInfo} />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
