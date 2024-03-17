import React, { memo, useEffect, useMemo, useState } from "react";
import { Switch } from "@nextui-org/switch";
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { getSettings, updateSettings } from "@/libs/utils/user";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useTheme } from "next-themes";

export default memo(function ThemeSwitch({ className }: { className?: string }) {

    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const { theme, setTheme, systemTheme } = useTheme();
    const [isSelected, setIsSelected] = useState(false);
    const dispatch = useAppDispatch();
    useMemo(() => {
        if (settings.theme === 'system' && systemTheme === 'light') {
            setIsSelected(true);
        } else {
            setIsSelected(settings.theme === 'light');
        }
    }, [systemTheme]);



    useEffect(() => {

        if (isSelected) {
            document?.querySelector('html')?.setAttribute('data-theme', 'light');
            document?.querySelector('body')?.setAttribute('data-theme', 'light');

            setTheme('light');
        }
        else {
            document?.querySelector('html')?.setAttribute('data-theme', 'dark');
            document?.querySelector('body')?.setAttribute('data-theme', 'dark');

            setTheme('dark');
        }
    }, [isSelected]);


    function toggleTheme() {
        const newMode = { ...settings, theme: isSelected ? 'dark' : 'light' } as Setting;
        updateSettings(newMode);
        dispatch(updateSettingsHandler(newMode));
        setTheme(newMode.theme);
        document?.querySelector('html')?.setAttribute('data-theme', newMode.theme);
        setIsSelected(newMode.theme === 'light');
    }



    return (
        <Switch
            title="Change theme"
            onChange={toggleTheme}
            size="lg"
            // isSelected={!appTheme ? windowTheme === 'light' : appTheme === 'light'}
            isSelected={isSelected}
            className={className}
            color="secondary"
            thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                    <BsFillSunFill className={className} />
                ) : (
                    <BsFillMoonStarsFill className={className} />
                )
            }
        />
    );
})