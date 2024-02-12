import { useEffect, useState } from 'react'
import './header.scss';
import { Button, Link, Navbar, NavbarBrand, Popover, PopoverContent, PopoverTrigger, User } from "@nextui-org/react";
import IconButton from '../IconButton';
import { MdNotifications, MdSearch } from 'react-icons/md';
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from '../useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings, logoutSession } from '@/libs/utils/user';
import { logoutHandler } from '@/libs/redux/reducers/LoginReducer';
import { getResizedAvatar } from '@/libs/utils/image';
import NavbarHeader from './NavbarDrawer';
import Image from 'next/image';
import { useSession } from 'next-auth/react';


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

    return (<Navbar shouldHideOnScroll
        className='shadow-xl w-full h-16  !px-0 !p-0'>
        <div className="main_header navbar !px-0 w-full">
            <NavbarHeader />

            <div className="navbar-center">
                <NavbarBrand>
                    <Link href={'/'}>
                        <Image
                            className='hidden md:block'
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
            </div>
            <div className="navbar-end space-x-2">
                <button className="">
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
        </div>
    </Navbar>

    )
}
