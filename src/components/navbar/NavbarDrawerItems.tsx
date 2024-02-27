'use client';

import React, { useEffect, useMemo, useState } from 'react'
import { FcSettings } from 'react-icons/fc';
import { FaInfoCircle, FaRocketchat, FaTools, FaUserCircle } from 'react-icons/fa';
import { VscListSelection } from 'react-icons/vsc'
import IconButton from '../IconButton';
import { Button, NavbarMenuItem } from '@nextui-org/react';
import ThemeSwitch from '../ThemeSwitch';
import SAvatar from '../SAvatar';
import { signOut, useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import secureLocalStorage from 'react-secure-storage';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { usePathname, useRouter } from 'next/navigation';
import Reputation from '../Reputation';
import { abbreviateNumber } from '@/libs/utils/helper';
import Link from 'next/link';
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from '../useLogin';
import { empty_profile } from '@/libs/constants/Placeholders';

const navigation = [
    { name: 'Chat', href: '/profile/blogs', value: 'chat', current: false, icon: <FaRocketchat className={'icon'} /> },
    { name: 'Tools', href: '#', value: 'tools', current: false, icon: <FaTools className={'icon'} /> },
    { name: 'Settings', href: '/settings', value: 'tools', current: false, icon: <FcSettings className={'icon'} /> },

];

const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
];


export default function NavbarDrawerItems() {
    const dispatch = useAppDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { credentials, isLogin } = useLogin();

    const loginInfo = useAppSelector(state => state.loginReducer.value) ?? empty_profile(credentials?.username ?? '');
    const posting_json_metadata = JSON.parse(loginInfo?.posting_json_metadata || '{}')

    function toggleDrawer() { setOpenDrawer(!openDrawer) }

    function handleItemClick() {
        if (openDrawer) {
            setOpenDrawer(false);
        }

    }


    useEffect(() => {
        handleItemClick();
    }, [pathname]);

    function handleLogout() {
        signOut();
        secureLocalStorage.removeItem('auth');
        dispatch(saveLoginHandler({ ...loginInfo, login: false }))


    }


    return (
        <div className="z-10">
            <input id="app-drawer" type="checkbox"
                checked={openDrawer}
                className="drawer-toggle"
                onChange={() => { }}
            />
            {/* Page content here */}
            <div className="drawer-content " >

                <label htmlFor="app-drawer" className="drawer-button">
                    <Button size='sm' radius='full' isIconOnly variant='light'
                        onPress={toggleDrawer}>
                        <VscListSelection className='text-lg' />
                    </Button>
                </label>

            </div>


            <div className="drawer-side overflow-y-auto">
                <label htmlFor="app-drawer" className="drawer-overlay cursor-none"
                    onClick={toggleDrawer}>

                </label>

                <div className="flex flex-col h-screen  bg-background gap-4 w-[200px]">
                    {isLogin() ?
                        <div className='flex flex-col  gap-4 bg-foreground/20 px-2 py-6 rounded-bl-xl shadow-md  shadow-foreground/50'>
                            <div className='flex flex-row gap-2 items-center'>
                                <SAvatar size='sm' username={credentials?.username ?? ''} />
                                <div className='flex flex-col items-start text-sm text-default-600'>

                                    <h4>{posting_json_metadata?.profile?.name}</h4>

                                    <div className='flex gap-2'>
                                        <h4>@{credentials?.username}</h4>
                                        {/* <Reputation sm reputation={79} /> */}
                                    </div>



                                </div>
                            </div>

                            <div className="flex flex-row gap-2" >
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-600 text-small">
                                        {abbreviateNumber(loginInfo.count_followers)}</p>
                                    <p className=" text-default-500 text-small">{'Followers'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-600 text-small">
                                        {abbreviateNumber(loginInfo.count_following)}</p>
                                    <p className="text-default-500 text-small">{'Following'}</p>
                                </div>

                            </div>
                        </div> : null}


                    <div className='flex flex-col gap-2 h-full p-2 text-default-600'>
                        {isLogin() && <Button className='w-full justify-start text-inherit '
                            variant='light'
                            onPress={() => router.push('/@faisalamin')}
                            startContent={<FaUserCircle className='text-xl' />}>
                            Profile
                        </Button>}

                        <Button variant='light'
                            className='w-full justify-start text-inherit '
                            startContent={<FaTools className='text-xl' />}>
                            Tools
                        </Button>

                        {isLogin() && < Button variant='light'
                            onPress={() => router.push(`@${credentials?.username}/settings`)}
                            className='w-full justify-start text-inherit '
                            startContent={<IoMdSettings className='text-xl' />}>
                            Settings
                        </Button>
                        }
                        <Button variant='light'
                            className='w-full justify-start text-inherit '
                            onPress={() => router.push('/about')}
                            startContent={<FaInfoCircle className='text-xl' />}>
                            About
                        </Button>
                        {isLogin() &&
                            < Button className='w-full justify-start text-danger '
                                variant='light'
                                onPress={handleLogout}
                                startContent={<IoLogOut className='text-xl text-default-600' />}>
                                Logout
                            </Button>}

                        {/* <Button
                                onPress={() => {
                                    router.push('/about')
                                }}
                                startContent={<FaInfoCircle className='text-lg' />}
                                className=' text-start'
                                color='default'
                                size="sm"  >
                                About
                            </Button>



                            <Button
                                onPress={() => {
                                    router.push('/about')
                                }}
                                color='default'
                                size="sm"  >
                                Tools
                            </Button>

                            <Button
                                onPress={handleLogout}
                                color='danger'
                                size="sm"  >
                                Logout
                            </Button> */}



                    </div>

                    <ThemeSwitch
                        className='flex-row-reverse p-2' />


                </div>



            </div>

        </div >
    )
}
