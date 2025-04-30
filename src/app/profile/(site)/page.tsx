"use client";

export const dynamic = "force-dynamic";
import AccountHeader from "@/components/AccountHeader";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { useSession } from "next-auth/react";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";
import ProfilePage from "./ProfilePage";
import useSWR from "swr";
import { fetchSds } from "@/libs/constants/AppFunctions";
import ChatModal from "@/components/chat/user/ChatModal";
import { useDisclosure } from "@heroui/modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useLogin } from "@/components/auth/AuthProvider";

export default function page() {
  const { username } = usePathnameClient();
  const { data: session } = useSession();
  const chatDisclosure = useDisclosure();
  const searchParams = useSearchParams();
  const chatParam = searchParams.has("chat");
  const router = useRouter();
  const pathname = usePathname();

  const { authenticateUser, isAuthorized } = useLogin();

  function openChat() {
    authenticateUser(false, true);
    if (!isAuthorized(true)) {
      return;
    }
    chatDisclosure.onOpen();
  }
  useEffect(() => {
    if (chatParam && !chatDisclosure.isOpen) {
      openChat();
      router.replace(pathname);
    }
  }, [chatParam]);

  const URL = `/accounts_api/getAccountExt/${username}/${
    session?.user?.name || "null"
  }`;

  const { data, isLoading, error } = useSWR(URL, fetchSds<AccountExt>, {
    suspense: true,
  });

  if (error) return <ErrorCard message={error?.message} />;
  if (isLoading) return <LoadingCard />;

  return (
    <MainWrapper
      endClassName="max-h-screen w-[320px] min-w-[320px] 1md:!hidden lg:!block"
      endContent={<ProfileInfoCard account={data} />}
    >
      <AccountHeader account={data} onChatPress={openChat} />

      <ProfilePage data={data} />

      {chatDisclosure.isOpen && data && (
        <ChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          account={data}
        />
      )}
    </MainWrapper>
  );
}
