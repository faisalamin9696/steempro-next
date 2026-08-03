"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Slider } from "@heroui/slider";
import {
  Network,
  Image as ImageIcon,
  ShieldAlert,
  Palette,
  Languages,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { Constants } from "@/constants";
import { useTheme } from "next-themes";
import SCard from "../ui/SCard";
import { useTranslations, useLocale } from "next-intl";
import { locales, localeNames } from "@/i18n/config";
import { setUserLocale } from "@/utils/actions/locale";

const checkRpcLatency = async (url: string): Promise<number> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "condenser_api.get_dynamic_global_properties",
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return Math.round(performance.now() - start);
    }
    return -1;
  } catch {
    clearTimeout(timeoutId);
    return -1;
  }
};

const GeneralSettings = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settingsReducer.value);
  const { setTheme } = useTheme();

  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [isPinging, setIsPinging] = useState(false);

  const measureLatencies = useCallback(async () => {
    setIsPinging(true);
    const results: Record<string, number> = {};
    await Promise.all(
      Constants.rpc_servers.map(async (url) => {
        results[url] = await checkRpcLatency(url);
      })
    );
    setLatencies(results);
    setIsPinging(false);
  }, []);

  useEffect(() => {
    measureLatencies();
  }, [measureLatencies]);

  if (!settings) return null;

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
            endContent={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  measureLatencies();
                }}
                disabled={isPinging}
                title="Re-test node latencies"
                className="p-1 text-default-400 hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={isPinging ? "animate-spin" : ""} />
              </button>
            }
            renderValue={(items) => {
              return items.map((item) => {
                const key = item.key as string;
                const isAuto = key === "auto";
                const latency = isAuto ? undefined : latencies[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between w-full gap-2 pr-2"
                  >
                    <span className="truncate">
                      {isAuto ? t("General.network.autoFailover") : key}
                    </span>
                    {!isAuto && latency !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
                          latency === -1
                            ? "text-danger bg-danger-50 dark:bg-danger-950/40"
                            : latency < 300
                            ? "text-success bg-success-50 dark:bg-success-950/40"
                            : latency < 800
                            ? "text-warning bg-warning-50 dark:bg-warning-950/40"
                            : "text-danger bg-danger-50 dark:bg-danger-950/40"
                        }`}
                      >
                        {latency === -1 ? "Offline" : `${latency} ms`}
                      </span>
                    )}
                  </div>
                );
              });
            }}
          >
            {["auto", ...Constants.rpc_servers].map((rpc) => {
              const isAuto = rpc === "auto";
              const latency = isAuto ? undefined : latencies[rpc];
              return (
                <SelectItem
                  key={rpc}
                  textValue={isAuto ? t("General.network.autoFailover") : rpc}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="truncate">
                      {isAuto ? t("General.network.autoFailover") : rpc}
                    </span>
                    {!isAuto && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          latency === undefined
                            ? "text-default-400 bg-default-100 animate-pulse"
                            : latency === -1
                            ? "text-danger bg-danger-50 dark:bg-danger-950/40 font-medium"
                            : latency < 300
                            ? "text-success bg-success-50 dark:bg-success-950/40 font-medium"
                            : latency < 800
                            ? "text-warning bg-warning-50 dark:bg-warning-950/40 font-medium"
                            : "text-danger bg-danger-50 dark:bg-danger-950/40 font-medium"
                        }`}
                      >
                        {latency === undefined
                          ? "..."
                          : latency === -1
                          ? "Offline"
                          : `${latency} ms`}
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
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
        iconColor="danger"
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
              aria-label={t("General.language.select")}
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
                aria-label={t("General.interface.theme")}
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
                aria-label={t("General.interface.feedStyle")}
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
                  aria-label={t("General.interface.defaultVote")}
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
