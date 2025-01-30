import React, { memo, useEffect } from "react";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FaSun } from "react-icons/fa";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { Switch } from "@heroui/switch";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { getSettings, updateSettings } from "@/libs/utils/user";

interface ThemeSwitchProps {
  className?: string;
  sm?: boolean;
}

export default memo(function ThemeSwitch({ className, sm }: ThemeSwitchProps) {
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { theme, setTheme, systemTheme } = useTheme();
  const dispatch = useAppDispatch();

  // Derive the current theme mode
  const isLightMode =
    theme === "light" || (theme === "system" && systemTheme === "light");

  useEffect(() => {
    const currentTheme = isLightMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.setAttribute("data-theme", currentTheme);
  }, [isLightMode]);

  const toggleTheme = () => {
    const newMode = {
      ...settings,
      theme: isLightMode ? "dark" : ("light" as ThemeMode),
    };
    updateSettings(newMode);
    dispatch(updateSettingsHandler(newMode));
    setTheme(newMode.theme);
  };

  if (sm) {
    return (
      <div className="flex flex-col gap-2" title="Change theme">
        <button
          onClick={toggleTheme}
          className={clsx(
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
        base: clsx(
          "inline-flex flex-row-reverse w-full max-w-md bg-default-400/20 dark:bg-default-500/20 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent "
        ),
        wrapper: "p-0 overflow-visible group-data-[selected]:bg-primary/50",
        thumb: clsx(
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
