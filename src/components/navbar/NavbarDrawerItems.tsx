'use client';

import React from 'react'
import Reputation from '../Reputation';
import { FcSettings } from 'react-icons/fc';
import { FaRocketchat, FaTools } from 'react-icons/fa';
import { VscListSelection } from 'react-icons/vsc'
import IconButton from '../IconButton';
import { Button, Link, NavbarMenu, NavbarMenuItem } from '@nextui-org/react';
import ThemeSwitch from '../ThemeSwitch';
import SAvatar from '../SAvatar';
import { signOut, useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import secureLocalStorage from 'react-secure-storage';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { useRouter } from 'next/navigation';

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
    const { data: session } = useSession();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const dispatch = useAppDispatch();
    const posting_json_metadata = JSON.parse(loginInfo?.posting_json_metadata || '{}')

    const router = useRouter();

    function handleItemClick() {
        document.getElementById('app-drawer')?.click();
    }

    function handleLogout() {
        signOut();
        secureLocalStorage.removeItem('auth');
        dispatch(saveLoginHandler({ ...loginInfo, login: false }))


    }


    return (<div className="navbar-start !px-0 ">
        <div className="drawer drawer-start">
            <input id="app-drawer" type="checkbox" className="drawer-toggle" />
            {/* Page content here */}
            <div className="drawer-content" >

                <label htmlFor="app-drawer" className="drawer-button cursor-pointer">
                    <IconButton as={'div'} onClick={undefined} IconType={VscListSelection} />
                </label>

            </div>


            <div className="drawer-side z-10">
                <label htmlFor="app-drawer" className="drawer-overlay"></label>

                <div className="flex flex-col h-full menu 
                p-4 w-[300px] bg-background gap-4">
                    {session?.user?.name ?
                        <div className='flex items-center space-x-3 mt-4 '>

                            <SAvatar username={session.user.name} />
                            <div className='flex flex-col content-center space-y-2'>
                                <div className='flex space-x-2'>
                                    <h4>@{session.user.name}</h4>
                                    {/* <Reputation reputation={loginInfo?.reputation} /> */}
                                </div>

                                <h4>{posting_json_metadata?.profile?.name}</h4>


                            </div>
                        </div> : null}


                    <div className='flex flex-col gap-2'>

                        <Button
                            onPress={() => {
                                router.push('/about')
                            }}
                            color='default'
                            size="sm"  >
                            About
                        </Button>

                        <Button
                            onPress={handleLogout}
                            color='danger'
                            size="sm"  >
                            Logout
                        </Button>

                    </div>


                    <ThemeSwitch
                        className='absolute bottom-0 flex-row-reverse p-4 gap-4' />

                </div>



            </div>

        </div>
    </div>)
}
