"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Settings, UserCircle, Shield } from "lucide-react";
import GeneralSettings from "@/components/settings/GeneralSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { useSession } from "next-auth/react";
import STabs from "@/components/ui/STabs";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const [activeTab, setActiveTab] = useState("general");
  const { data: session } = useSession();
  const { isMobile } = useDeviceInfo();

  return (
    <STabs
      aria-label={t("title")}
      color="primary"
      classNames={{
        panel: "px-0",
      }}
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key as string)}
      items={[
        {
          id: "general",
          title: t("tabs.general"),
          icon: <Settings size={18} />,
          content: (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 ">
              <GeneralSettings />
            </div>
          ),
        },
        {
          id: "profile",
          title: t("tabs.profile"),
          icon: <UserCircle size={18} />,
          content: (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <ProfileSettings />
            </div>
          ),
        },
        {
          id: "security",
          title: t("tabs.security"),
          icon: <Shield size={18} />,
          content: (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <SecuritySettings />
            </div>
          ),
        },
      ]}
      tabTitle={(tab) => (
        <div className="flex items-center space-x-2">
          {tab.icon}
          {!isMobile || activeTab === tab.id ? (
            <span>{tab.title}</span>
          ) : null}{" "}
        </div>
      )}
    >
      {(tab) => tab.content}
    </STabs>
  );
}
