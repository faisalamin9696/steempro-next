import React, { memo, useEffect, useState } from "react";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FaSun } from "react-icons/fa";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { Switch } from "@heroui/switch";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { getSettings, updateSettings } from "@/libs/utils/user";
import { twMerge } from "tailwind-merge";

interface ThemeSwitchProps {
  className?: string;
  sm?: boolean;
}

export default memo(function ThemeSwitch({ className, sm }: ThemeSwitchProps) {
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive the current theme mode
  const isLightMode =
    theme === "light" || (theme === "system" && systemTheme === "light");

  const toggleTheme = () => {
    const newMode = {
      ...settings,
      theme: isLightMode ? "dark" : ("light" as ThemeMode),
    };
    updateSettings(newMode);
    dispatch(updateSettingsHandler(newMode));
    setTheme(newMode.theme);
  };

  if (!mounted) {
    return null;
  }

  if (sm) {
    return (
      <div className="flex flex-col gap-2" title="Change theme">
        <button
          onClick={toggleTheme}
          className={twMerge(
            "w-6 h-6 flex items-center justify-center rounded-full hover:bg-default-200",
            className
          )}
        >
          {isLightMode ? <BsFillMoonStarsFill /> : <FaSun />}
        </button>
      </div>
    );
  }

  return (
    <Switch
      isSelected={!isLightMode}
      onValueChange={toggleTheme}
      endContent={<RiMoonFill />}
      startContent={<RiSunFill />}
      className={"mt-2"}
      classNames={{
        base: twMerge(
          "inline-flex flex-row-reverse w-full max-w-md bg-default-400/20 dark:bg-default-500/20 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent "
        ),
        wrapper: "p-0 overflow-visible group-data-[selected]:bg-primary/50",
        thumb: twMerge(
          "border-2 shadow-lg ",
          "group-data-[hover=true]:border-primary",
          "group-data-[selected=true]:ms-6",
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ms-4"
        ),
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-medium">Dark Mode</p>
      </div>
    </Switch>
  );
});
