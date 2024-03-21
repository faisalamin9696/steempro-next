import React, { memo, useEffect, useMemo, useState } from "react";
import { BsFillMoonStarsFill } from 'react-icons/bs';
import { getSettings, updateSettings } from "@/libs/utils/user";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useTheme } from "next-themes";
import { useSwitch } from "@nextui-org/switch";
import { FaSun } from "react-icons/fa";

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
    const {
        Component,
        slots,
        getBaseProps,
        getInputProps,
        getWrapperProps,
    } = useSwitch({ onChange: toggleTheme, color: 'default' });

    return (
        <div className="flex flex-col gap-2" title="Change theme">
            <Component {...getBaseProps()}>
                <div className="hidden">
                    <input {...getInputProps()} />
                </div>
                <div
                    {...getWrapperProps()}
                    className={slots.wrapper({
                        class: [
                            "w-6 h-6",
                            "flex items-center justify-center ",
                            "rounded-full hover:bg-default-200",
                        ],
                        color: 'primary'
                    })}
                >
                    {isSelected ? <FaSun className={className} /> :
                        <BsFillMoonStarsFill className={className} />}
                </div>
            </Component>
        </div>
    )

});