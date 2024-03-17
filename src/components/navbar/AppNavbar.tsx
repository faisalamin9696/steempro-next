'use client';

import React, { useMemo } from 'react'
import './header.scss';
import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";
import { Popover, PopoverTrigger, PopoverContent, } from '@nextui-org/popover';
import { Button } from '@nextui-org/button';
import { User } from '@nextui-org/user';
import { Badge } from '@nextui-org/badge';
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from '../useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getCredentials } from '@/libs/utils/user';
import { getResizedAvatar } from '@/libs/utils/image';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import AccountsModal from '../AccountsModal';
import AppDrawer from './AppDrawer';
import NotificationsCard from '../NotificationsCard';
import { FaRegBell } from 'react-icons/fa';
import Link from 'next/link';

export default function AppNavbar() {

    const { authenticateUser, isLogin } = useLogin();
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session, status } = useSession();
    const [isPopOpen, setIsPopOpen] = React.useState(false);
    const [isAccOpen, setIsAccOpen] = React.useState(false);
    const [notificationPopup, setNotificationPopup] = React.useState(false);


    // validate the local storage auth
    useMemo(() => {
        const credentials = getCredentials();

        if (status === 'authenticated') {
            if (!credentials?.username) {
                signOut();
            }
        }

        if (status === 'unauthenticated' && !!credentials?.username) {
            signIn('credentials', {
                username: credentials.username,
                redirect: false
            });

        }
    }, [status]);


    function handleLogin() {
        authenticateUser();
    }


    return (
        <Navbar
            className='shadow-xl w-full h-16  !px-0 !p-0'
            shouldHideOnScroll>

            <NavbarContent justify="start" className=' !grow-0'>
                <AppDrawer onAccountSwitch={() => setIsAccOpen(!isAccOpen)} />
            </NavbarContent>




            <NavbarBrand
                className="">

                <Link href={'/'} className=''>
                    <Image
                        className='hidden sm:block'
                        src={'/logo-default.png'}
                        alt='logo'
                        priority
                        height={40}
                        width={150}
                        style={{ height: 'auto' }}
                    />
                </Link>
                <Link href={'/'}>
                    <Image priority className='hidden max-sm:block'
                        src={'/logo192.png'}
                        alt='logo'
                        height={35}
                        width={35}
                        style={{ width: 'auto', height: 'auto' }}
                    />

                </Link>
            </NavbarBrand>


            <NavbarContent as="div" className="items-center z-0 " justify="end">
                <div className="flex flex-row gap-2 items-center">

                    {/* <Input
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
                    /> */}

                    {/* <Button radius='full'
                        className='1md:hidden '
                        isIconOnly size='sm' variant='light'
                        onPress={() => {
                            authenticateUser();
                        }}>
                        <MdSearch className='text-xl text-default-600 ' />
                    </Button> */}


                    <Button radius='full' as={Link} href={'/submit'}

                        isIconOnly size='sm' variant='light'>
                        <LuPencilLine className='text-xl text-default-600' />
                    </Button>
                    <Popover style={{
                        zIndex: 50,
                    }}
                        placement="right" isOpen={notificationPopup}
                        onOpenChange={setNotificationPopup}>
                        <PopoverTrigger >
                            <Badge className=' max-sm:hidden'
                                content={
                                    loginInfo.unread_count > 99 ?
                                        '99+' : loginInfo.unread_count > 0 && loginInfo.unread_count}
                                shape="circle" color="primary" size='sm'>
                                <Button
                                    size='sm'
                                    radius="full"
                                    isIconOnly
                                    isDisabled={!!!loginInfo.name}
                                    className='text-default-600 max-sm:hidden'
                                    onPress={() => { setNotificationPopup(!notificationPopup) }}
                                    aria-label="more than 99 notifications"
                                    variant="light"
                                >
                                    <FaRegBell className='text-xl text-default-600' />
                                </Button>
                            </Badge>

                        </PopoverTrigger>
                        <PopoverContent>
                            <NotificationsCard username={loginInfo.name} />
                        </PopoverContent>
                    </Popover>




                    {isLogin() ?
                        <Popover placement="top" color='default'
                            classNames={{ base: '!z-[10]' }}
                            shouldCloseOnBlur={false}
                            isOpen={isPopOpen} onOpenChange={(open) => setIsPopOpen(open)}>
                            <PopoverTrigger>
                                <User
                                    as="button"
                                    name=""
                                    className="transition-transform"
                                    avatarProps={{
                                        src: getResizedAvatar(loginInfo.name)
                                    }}
                                />
                            </PopoverTrigger>
                            <PopoverContent>
                                <ul tabIndex={0} className="menu menu-sm" onClick={() => {
                                    if (isPopOpen) setIsPopOpen(false);
                                }}>
                                    <li><Link href={`/@${loginInfo.name}`}>Profile</Link></li>
                                    <li><a onClick={() => setIsAccOpen(!isAccOpen)}>Switch Account</a></li>
                                    <li className='hidden max-sm:block'><a onClick={() => setNotificationPopup(!notificationPopup)}>{'Notifications'}</a></li>
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
