import React, { useEffect, useState } from 'react'
import './header.scss';
import { Button, Input, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Popover, PopoverContent, PopoverTrigger, User } from "@nextui-org/react";
import IconButton from '../IconButton';
import { MdNotifications, MdSearch } from 'react-icons/md';
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from '../useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings, logoutSession } from '@/libs/utils/user';
import { logoutHandler } from '@/libs/redux/reducers/LoginReducer';
import { getResizedAvatar } from '@/libs/utils/image';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ThemeSwitch from '../ThemeSwitch';
import dynamic from 'next/dynamic';
const NavbarDrawerItems = dynamic(() => import('./NavbarDrawerItems'))


export default function AppNavbar() {

    const { credentials, authenticateUser, isLoggedIn } = useLogin()
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session, status } = useSession();


    function handleLogout() {
        logoutSession();
        dispatch(logoutHandler());
    }

    function handleLogin() {
        authenticateUser();
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    // const queryKey = [`profile-${credentials?.username}`];
    // const userQuery = useQuery({
    //     enabled: !!credentials?.username,
    //     queryKey,
    //     gcTime: 10 * Minute, // 10 minutes
    //     queryFn: () => getAuthorExt(credentials?.username ?? ''),
    //     retry: 0,
    //     refetchInterval: 10 * Minute// 5 minutes
    // });

    // if (userQuery.isSuccess) {
    //     dispatch(saveLoginHandler({ ...userQuery.data, login: true }));

    // }

    // const queryKeyGlobals = [`globals`];
    // const globalsQuery = useQuery({
    //     queryKey: queryKeyGlobals,
    //     gcTime: 10 * Minute, // 10 minutes
    //     queryFn: () => getSteemGlobal(),
    //     refetchInterval: 10 * Minute// 5 minutes
    // });

    // if (globalsQuery.isSuccess) {
    //     dispatch(addSteemGlobals(globalsQuery.data));

    // }

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}
            className='shadow-xl w-full h-16  !px-0 !p-0'
            shouldHideOnScroll>

            <NavbarContent justify='start' className=' z-10'>
                <NavbarDrawerItems />
            </NavbarContent>
            {/* 
            <NavbarMenuToggle
                draggable
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className=" z-10"
            >
                <NavbarDrawerItems />
            </NavbarMenuToggle> */}
            <NavbarBrand className="justify-center absolute right-0 left-0 z-0">

                <Link href={'/'}>
                    <Image
                        className='hidden sm:block'
                        src={'/logo-default.png'}
                        alt='logo'
                        placeholder='blur'
                        blurDataURL={'/logo-default.png'}
                        priority
                        height={40}
                        width={150}
                        style={{ width: 'auto' }}

                    />
                    <Image priority className='hidden max-sm:block'
                        placeholder='blur'
                        blurDataURL={'/logo192.png'}
                        src={'/logo192.png'}
                        alt='logo'
                        height={40}
                        width={40}
                        style={{ width: 'auto' }}
                    />

                </Link>
            </NavbarBrand>


            <NavbarContent as="div" className="items-center" justify="end">
                <div className="flex flex-row gap-2 items-center">

                    <Input
                        radius='full'
                        className='hidden lg:block'
                        classNames={{
                            base: "max-w-full sm:max-w-[10rem] h-8",
                            mainWrapper: "h-full ",
                            input: "text-tiny",
                            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",

                        }}
                        placeholder="Type to search..."
                        size="sm"
                        startContent={<MdSearch size={18} />}
                        type="search"
                    />

                    <button className="hidden max-lg:block">
                        <IconButton as={'div'} onClick={undefined} IconType={MdSearch} />
                    </button>

                    <button className="">
                        <IconButton as={Link} href='/submit' onClick={undefined} IconType={LuPencilLine} />
                    </button>
                    <button className="max-sm:hidden ">
                        <div className="relative">
                            <IconButton as={'div'} onClick={undefined} IconType={MdNotifications} />
                            <span className="absolute top-0 right-0 badge badge-xs badge-info indicator-item"></span>
                        </div>
                    </button>

                    {isLoggedIn ? <Popover placement="top" color='default'>
                        <PopoverTrigger>
                            <User
                                as="button"
                                name=""
                                className="transition-transform"
                                avatarProps={{
                                    src: getResizedAvatar(session?.user?.name ?? '')
                                }}
                            />
                        </PopoverTrigger>
                        <PopoverContent>
                            <ul tabIndex={0} className="menu menu-sm ">
                                <li><a>'Switch Account</a></li>
                                <li><a>{'Notifications'}</a></li>
                                <li><a onClick={handleLogout}>{'Logout'}</a></li>

                            </ul>
                        </PopoverContent>
                    </Popover>
                        :
                        <Button size='sm' variant='ghost'
                            onPress={handleLogin}
                            color='success'
                            isLoading={status === 'loading'}
                            isIconOnly={status === 'loading'}
                            radius={status === 'loading' ? 'full' : 'sm'}
                        >{(isLoggedIn) ? '' : 'Login'}</Button>
                    }

                </div>
            </NavbarContent>

            <NavbarMenu>

                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <Link
                            color={
                                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
                            }
                            className="w-full"
                            href="#"
                            size="lg"
                        >
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}

                <NavbarMenuItem className='flex gap-2'>
                    <p>Theme</p>
                    <ThemeSwitch />
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>


    )
}
