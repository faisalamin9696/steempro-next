"use client";

import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Slider } from "@heroui/slider";
import {
  Network,
  Image as ImageIcon,
  ShieldAlert,
  Palette,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { Constants } from "@/constants";
import { useTheme } from "next-themes";
import SCard from "../ui/SCard";

const GeneralSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settingsReducer.value);
  if (!settings) return null;
  const { setTheme } = useTheme();

  const handleUpdate = (updatedFields: Partial<Setting>) => {
    dispatch(updateSettingsHandler(updatedFields));
    window?.location?.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Network & RPC */}
      <SCard
        className="card"
        icon={Network}
        title="Network & RPC"
        iconSize="sm"
        iconColor="primary"
        description="Configure your connection to the Steem blockchain"
      >
        <div className="space-y-4">
          <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200 max-w-md">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">Automatic Selection</p>
              <p className="text-xs text-default-600">
                Automatically select the best available node
              </p>
            </div>
            <Switch
              isSelected={settings.auto_rpc}
              onValueChange={(isSelected) =>
                handleUpdate({ auto_rpc: isSelected })
              }
              size="sm"
            />
          </div>

          <Select
            label="RPC Node"
            placeholder="Select an RPC server"
            selectedKeys={settings.auto_rpc ? ["auto"] : [settings.rpc]}
            onSelectionChange={(keys) => {
              const rpc = Array.from(keys)[0] as string;
              if (rpc === "auto") {
                handleUpdate({ auto_rpc: true });
              } else if (rpc) {
                handleUpdate({ rpc, auto_rpc: false });
              }
            }}
            className="max-w-md"
            variant="faded"
            classNames={{ description: "text-muted mt-1" }}
            description="High-performance nodes provide a smoother experience"
            size="sm"
          >
            {["auto", ...Constants.rpc_servers].map((rpc) => (
              <SelectItem key={rpc}>
                {rpc === "auto" ? "Auto (Failover)" : rpc}
              </SelectItem>
            ))}
          </Select>
        </div>
      </SCard>

      {/* Media & Content */}
      <SCard
        className="card"
        icon={ImageIcon}
        title="Media & Content"
        iconSize="sm"
        iconColor="warning"
        description="Manage image hosting and content visibility"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Image Server"
              placeholder="Select image hosting"
              selectedKeys={[settings.image_server]}
              onSelectionChange={(keys) => {
                const image_server = Array.from(keys)[0] as string;
                if (image_server) handleUpdate({ image_server });
              }}
              variant="faded"
              classNames={{ description: "text-muted mt-1" }}
              size="sm"
            >
              {Constants.image_servers.map((server) => (
                <SelectItem key={server}>{server}</SelectItem>
              ))}
            </Select>

            <Select
              label="NSFW Content"
              placeholder="Set your preference"
              selectedKeys={[settings.nsfw]}
              onSelectionChange={(keys) => {
                const nsfw = Array.from(keys)[0] as NSFW;
                if (nsfw) handleUpdate({ nsfw });
              }}
              variant="faded"
              classNames={{ description: "text-muted mt-1" }}
              startContent={<ShieldAlert size={18} className="text-warning" />}
              size="sm"
            >
              <SelectItem key="Always show">Always show</SelectItem>
              <SelectItem key="Always hide">Always hide</SelectItem>
              <SelectItem key="Always warn">Always warn</SelectItem>
            </Select>
          </div>
        </div>
      </SCard>

      {/* Interface Preferences */}
      <SCard
        className="card"
        icon={Palette}
        title="Interface Preferences"
        iconSize="sm"
        iconColor="secondary"
        description="Customize your viewing experience"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">Theme</p>
                <p className="text-xs text-default-600">Set your theme</p>
              </div>
              <Select
                size="sm"
                selectedKeys={[settings.theme]}
                onSelectionChange={(keys) => {
                  const theme = Array.from(keys)[0] as ThemeMode;
                  if (theme) {
                    setTheme(theme);
                    handleUpdate({ theme });
                  }
                }}
                className="w-[120px]"
                variant="faded"
                classNames={{
                  description: "text-muted mt-1",
                }}
              >
                <SelectItem key="system">System</SelectItem>
                <SelectItem key="light">Light</SelectItem>
                <SelectItem key="dark">Dark</SelectItem>
              </Select>
            </div>

            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">Feed Style</p>
                <p className="text-xs text-default-600">Display mode</p>
              </div>
              <Select
                size="sm"
                selectedKeys={[settings.feed_style]}
                onSelectionChange={(keys) => {
                  const feed_style = Array.from(keys)[0] as FeedStyle;
                  if (feed_style) handleUpdate({ feed_style });
                }}
                className="w-[120px]"
                variant="faded"
                classNames={{
                  description: "text-muted mt-1",
                }}
              >
                <SelectItem key="list">List</SelectItem>
                <SelectItem key="blogs">Blog</SelectItem>
                <SelectItem key="grid">Grid</SelectItem>
              </Select>
            </div>

            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">Remember Vote</p>
                <p className="text-xs text-default-600">Use last weight</p>
              </div>
              <Switch
                isSelected={settings.vote.remember}
                onValueChange={(isSelected) =>
                  handleUpdate({
                    vote: { ...settings.vote, remember: isSelected },
                  })
                }
                size="sm"
              />
            </div>

            {!settings.vote.remember && (
              <div className="flex flex-col gap-1 bg-default-100 p-3 rounded-xl border border-default-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">Default Vote %</p>
                  <span className="text-primary text-sm font-bold">
                    {settings.vote.value}%
                  </span>
                </div>
                <Slider
                  step={1}
                  maxValue={100}
                  minValue={1}
                  value={settings.vote.value}
                  size="sm"
                  onChange={(value) =>
                    handleUpdate({
                      vote: { ...settings.vote, value: value as number },
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </SCard>
    </div>
  );
};

export default GeneralSettings;
