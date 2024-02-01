import React, { useMemo } from 'react'
import { FaThList } from 'react-icons/fa'
import IconButton from './IconButton'
import clsx from 'clsx';
import { SiElasticstack } from 'react-icons/si';
import { getSettings, updateSettings } from '@/libs/utils/user';
import { updateSettingsHandler } from '@/libs/redux/reducers/SettingsReducer';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { CiGrid41 } from "react-icons/ci";
import { LuLayoutList } from "react-icons/lu";
import { TbLayoutList } from "react-icons/tb";

export default function FeedPatternSwitch() {
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const dispatch = useAppDispatch();

    const updateStyle = (style: FeedStyle) => {
        updateSettings({ ...settings, feedStyle: style });
        dispatch(updateSettingsHandler({ ...settings, feedStyle: style }));
    }

    return (
        useMemo(() => {

            return <div className='flex space-x-1'>
                <IconButton size='md'
                    className={clsx('text-xl', settings.feedStyle === 'list' && 'text-secondary')}
                    IconType={LuLayoutList} onClick={() => { updateStyle('list') }} />
                {/* <IconButton size='md'
                    className={clsx('text-xl', settings.feedStyle === 'blogs' && 'text-secondary')}
                    IconType={TbLayoutList} onClick={() => { updateStyle('blogs') }} /> */}
                <IconButton size='md'
                    className={clsx('text-xl', settings.feedStyle === 'grid' && 'text-secondary')}
                    IconType={CiGrid41} onClick={() => { updateStyle('grid') }} />
                {/* <IconButton
                className={clsx('text-xl', settings.feedStyle === 'grid' && 'text-secondary')}
                IconType={BsFillGrid3X3GapFill} onClick={() => { updateStyle('grid') }} /> */}
            </div>

        }, [settings.feedStyle])

    )
}
