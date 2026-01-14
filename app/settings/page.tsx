"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Settings, UserCircle, Shield } from "lucide-react";
import GeneralSettings from "@/components/settings/GeneralSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { data: session } = useSession();

  return (
    <Tabs
      aria-label="Settings Options"
      color="primary"
      classNames={{
        panel: "px-0",
      }}
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key as string)}
    >
      <Tab
        key="general"
        title={
          <div className="flex items-center space-x-2">
            <Settings size={18} />
            <span>General</span>
          </div>
        }
      >
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 ">
          <GeneralSettings />
        </div>
      </Tab>
      <Tab
        key="profile"
        title={
          <div className="flex items-center space-x-2">
            <UserCircle size={18} />
            <span>Profile</span>
          </div>
        }
      >
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
          <ProfileSettings />
        </div>
      </Tab>

      <Tab
        key="security"
        title={
          <div className="flex items-center space-x-2">
            <Shield size={18} />
            <span>Security</span>
          </div>
        }
      >
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
          <SecuritySettings />
        </div>
      </Tab>
    </Tabs>
  );
}
