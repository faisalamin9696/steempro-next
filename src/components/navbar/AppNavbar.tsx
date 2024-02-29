import React, { useEffect, useMemo, useState } from 'react'
import './header.scss';
import { Button, Input, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Popover, PopoverContent, PopoverTrigger, User } from "@nextui-org/react";
import IconButton from '../IconButton';
import { MdNotifications, MdSearch } from 'react-icons/md';
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from '../useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getCredentials, getSettings, logoutSession } from '@/libs/utils/user';
import { logoutHandler } from '@/libs/redux/reducers/LoginReducer';
import { getResizedAvatar } from '@/libs/utils/image';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import AccountsModal from '../AccountsModal';
const NavbarDrawerItems = dynamic(() => import('./NavbarDrawerItems'))


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

export default function AppNavbar() {

    const { authenticateUser, isLogin } = useLogin();
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isPopOpen, setIsPopOpen] = React.useState(false);
    const [isAccOpen, setIsAccOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);



    // validate the local storage auth
    useMemo(() => {
        const credentials = getCredentials();
        if (status === 'authenticated') {
            if (!credentials?.username) signOut();
        }

        if (status === 'unauthenticated' && credentials?.username) {
            signIn('credentials', {
                username: credentials.username,
                redirect: false
            });

        }
    }, [status]);

    function handleLogout() {
        logoutSession();
        dispatch(logoutHandler());
    }

    function handleLogin() {
        authenticateUser();
    }



    return (
        <Navbar
            className='shadow-xl w-full h-16  !px-0 !p-0'
            shouldHideOnScroll={!isMenuOpen}
            isMenuOpen={isMenuOpen}

            onMenuOpenChange={setIsMenuOpen}>

            <NavbarContent justify="start" className=' !grow-0'>
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu >
                <NavbarDrawerItems onItemClick={() => {
                    setIsMenuOpen(!isMenuOpen)
                }} />
            </NavbarMenu>

            <NavbarContent justify='center'>
                <NavbarBrand
                    className="">

                    <Link href={'/'} className=''>
                        <Image
                            className='hidden sm:block'
                            src={'/logo-default.png'}
                            alt='logo'
                            placeholder='blur'
                            blurDataURL={'/logo-default.png'}
                            priority
                            height={40}
                            width={150}
                            style={{  height: 'auto' }}

                        />
                    </Link>
                    <Link href={'/'}>
                        <Image priority className='hidden max-sm:block'
                            placeholder='blur'
                            blurDataURL={'/logo192.png'}
                            src={'/logo192.png'}
                            alt='logo'
                            height={40}
                            width={40}

                            style={{ width: 'auto', height: 'auto' }}
                        />

                    </Link>
                </NavbarBrand>
            </NavbarContent>





            <NavbarContent as="div" className="items-center z-0 " justify="end">
                <div className="flex flex-row gap-2 items-center">

                    <Input
                        radius='full'
                        className='hidden 1md:block'
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

                    <Button radius='full'
                        className='1md:hidden '
                        isIconOnly size='sm' variant='light'
                        onPress={() => {
                            authenticateUser();
                        }}>
                        <MdSearch className='text-xl text-default-600 ' />
                    </Button>


                    <Button radius='full' onPress={() => router.push('/submit')} isIconOnly size='sm' variant='light'>
                        <LuPencilLine className='text-xl text-default-600' />
                    </Button>


                    <button className="max-sm:hidden ">
                        <div className="relative">
                            <IconButton as={'div'} onClick={undefined} IconType={MdNotifications} />
                            <span className="absolute top-0 right-0 badge badge-xs badge-info indicator-item"></span>
                        </div>
                    </button>

                    {isLogin() ?
                        <Popover placement="top" color='default' shouldCloseOnBlur={false}
                            isOpen={isPopOpen} onOpenChange={(open) => setIsPopOpen(open)}>
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
                                <ul tabIndex={0} className="menu menu-sm" onClick={() => {
                                    if (isPopOpen) setIsPopOpen(false);
                                }}>
                                    <li><a onClick={() => setIsAccOpen(true)}>Switch Account</a></li>
                                    <li><a>{'Notifications'}</a></li>
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
                        >{(isLogin()) ? '' : 'Login'}</Button>
                    }

                </div>
            </NavbarContent>
            {isAccOpen &&
                <AccountsModal isOpen={isAccOpen} onOpenChange={setIsAccOpen} />
            }
        </Navbar>


    )
}
