import React from 'react'
import Reputation from '../Reputation';
import { FcSettings } from 'react-icons/fc';
import { FaRocketchat, FaTools } from 'react-icons/fa';
import { VscListSelection } from 'react-icons/vsc'
import IconButton from '../IconButton';
import { useLogin } from '../useLogin';
import { Link } from '@nextui-org/react';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import ThemeSwitch from '../ThemeSwitch';
import SAvatar from '../SAvatar';


export default function NavbarHeader() {
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { isLoggedIn } = useLogin();


    const navigation = [
        { name: 'Chat', href: '/profile/blogs', value: 'chat', current: false, icon: <FaRocketchat className={'icon'} /> },
        { name: 'Tools', href: '#', value: 'tools', current: false, icon: <FaTools className={'icon'} /> },
        { name: 'Settings', href: '/settings', value: 'tools', current: false, icon: <FcSettings className={'icon'} /> },

    ];

    const updatedNavigation = navigation.map((item) => ({
        ...item,
    }));

    function handleItemClick() {
        document.getElementById('my-drawer-4')?.click();
    }

    return (<div className="navbar-start !px-0 ">
        <div className="drawer drawer-start">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            {/* Page content here */}
            <div className="drawer-content" >

                <label htmlFor="my-drawer-4" className="drawer-button cursor-pointer">
                    <IconButton as={'div'} onClick={undefined} IconType={VscListSelection} />
                </label>

            </div>


            <div className="drawer-side z-10">
                <label htmlFor="my-drawer-4" className="drawer-overlay"></label>

                <ul className="menu p-4 w-80 min-h-full bg-background dark:bg-base-200 text-base-content">
                    {/* Sidebar content here */}
                    {isLoggedIn ?
                        <div className='flex items-center space-x-3  mt-4'>

                            <SAvatar size={'md'} username={loginInfo.name} />
                            <div className='flex flex-col content-center space-y-2'>
                                <div className='flex space-x-2'>
                                    <h4>@{loginInfo.name}</h4>
                                    <Reputation reputation={loginInfo?.reputation} />
                                </div>

                                <h4>{loginInfo.posting_json_metadata?.profile?.name}</h4>


                            </div>
                        </div> : null}
                    {updatedNavigation.map((item) => (
                        <Link
                            className=' drawer-start p-4 text-md mt-4 shadow-sm border rounded-md border-gray-700'
                            aria-current={item.current ? 'page' : undefined}
                            key={item.name}
                            onClick={handleItemClick}
                            href={item.href}
                            title={item.name}>
                            <div className='flex gap-4 items-center'>
                                <div>
                                    {item.icon}
                                </div>

                                <div>
                                    {item.name}
                                </div>

                            </div>
                        </Link>

                    ))}

                </ul>

                <ThemeSwitch
                    className='absolute bottom-0 flex-row-reverse p-4 gap-4' />

            </div>

        </div>
    </div>)
}
