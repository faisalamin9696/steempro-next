"use client";

import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Slider } from "@heroui/slider";
import {
  Network,
  Image as ImageIcon,
  ShieldAlert,
  Palette,
  Languages,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { Constants } from "@/constants";
import { useTheme } from "next-themes";
import SCard from "../ui/SCard";
import { useTranslations, useLocale } from "next-intl";
import { locales, localeNames } from "@/i18n/config";
import { setUserLocale } from "@/utils/actions/locale";

const GeneralSettings = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settingsReducer.value);
  if (!settings) return null;
  const { setTheme } = useTheme();

  const handleUpdate = (updatedFields: Partial<Setting>) => {
    dispatch(updateSettingsHandler(updatedFields));
    // window?.location?.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Network & RPC */}
      <SCard
        className="card"
        icon={Network}
        title={t("General.network.title")}
        iconSize="sm"
        iconColor="primary"
        description={t("General.network.description")}
      >
        <div className="space-y-4">
          <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200 max-w-md">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">
                {t("General.network.autoSelection")}
              </p>
              <p className="text-xs text-default-600">
                {t("General.network.autoSelectionDesc")}
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
            label={t("General.network.rpcNode")}
            placeholder={t("General.network.placeholder")}
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
            description={t("General.network.rpcNodeDesc")}
            size="sm"
          >
            {["auto", ...Constants.rpc_servers].map((rpc) => (
              <SelectItem key={rpc}>
                {rpc === "auto" ? t("General.network.autoFailover") : rpc}
              </SelectItem>
            ))}
          </Select>
        </div>
      </SCard>

      {/* Media & Content */}
      <SCard
        className="card"
        icon={ImageIcon}
        title={t("General.media.title")}
        iconSize="sm"
        iconColor="warning"
        description={t("General.media.description")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t("General.media.imageServer")}
              placeholder={t("General.media.imageServerPlaceholder")}
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
              label={t("General.media.nsfwLabel")}
              placeholder={t("General.media.nsfwPlaceholder")}
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
              <SelectItem key="Always show">
                {t("General.media.nsfwAlwaysShow")}
              </SelectItem>
              <SelectItem key="Always hide">
                {t("General.media.nsfwAlwaysHide")}
              </SelectItem>
              <SelectItem key="Always warn">
                {t("General.media.nsfwAlwaysWarn")}
              </SelectItem>
            </Select>
          </div>
        </div>
      </SCard>

      {/* Language */}
      <SCard
        className="card"
        icon={Languages}
        title={t("General.language.title")}
        iconSize="sm"
        iconColor="secondary"
        description={t("General.language.description")}
      >
        <div className="space-y-4">
          <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200 max-w-md">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">
                {t("General.language.select")}
              </p>
            </div>
            <Select
              size="sm"
              selectedKeys={[locale]}
              onSelectionChange={async (keys) => {
                const newLocale = Array.from(keys)[0] as any;
                if (newLocale) {
                  await setUserLocale(newLocale);
                  window.location.reload();
                }
              }}
              className="w-[150px]"
              variant="faded"
            >
              {locales.map((loc) => (
                <SelectItem key={loc}>
                  {localeNames[loc as keyof typeof localeNames]}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </SCard>

      {/* Interface Preferences */}
      <SCard
        className="card"
        icon={Palette}
        title={t("General.interface.title")}
        iconSize="sm"
        iconColor="secondary"
        description={t("General.interface.description")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">
                  {t("General.interface.theme")}
                </p>
                <p className="text-xs text-default-600">
                  {t("General.interface.themeDesc")}
                </p>
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
                <SelectItem key="system">
                  {t("General.interface.themeSystem")}
                </SelectItem>
                <SelectItem key="light">
                  {t("General.interface.themeLight")}
                </SelectItem>
                <SelectItem key="dark">
                  {t("General.interface.themeDark")}
                </SelectItem>
              </Select>
            </div>

            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">
                  {t("General.interface.feedStyle")}
                </p>
                <p className="text-xs text-default-600">
                  {t("General.interface.feedStyleDesc")}
                </p>
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
                <SelectItem key="list">
                  {t("General.interface.feedStyleList")}
                </SelectItem>
                <SelectItem key="blogs">
                  {t("General.interface.feedStyleBlog")}
                </SelectItem>
                <SelectItem key="grid">
                  {t("General.interface.feedStyleGrid")}
                </SelectItem>
              </Select>
            </div>

            <div className="flex flex-row justify-between items-center bg-default-100 p-3 rounded-xl border border-default-200">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">
                  {t("General.interface.vote")}
                </p>
                <p className="text-xs text-default-600">
                  {t("General.interface.voteDesc")}
                </p>
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
                  <p className="text-sm font-semibold">
                    {t("General.interface.defaultVote")}
                  </p>
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
