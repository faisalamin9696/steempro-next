'use client';

import React, { useMemo, useState } from 'react'
import './header.scss';
import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";
import { Popover, PopoverTrigger, PopoverContent, } from '@nextui-org/popover';
import { Button } from '@nextui-org/button';
import { Badge } from '@nextui-org/badge';
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from '../useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getCredentials, saveSessionKey, sessionKey } from '@/libs/utils/user';
import { getResizedAvatar } from '@/libs/utils/image';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import AccountsModal from '../AccountsModal';
import AppDrawer from './AppDrawer';
import NotificationsCard from '../NotificationsCard';
import { FaRegBell } from 'react-icons/fa';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { toast } from 'sonner';
import SearchModal from '../SearchModal';
import { MdSearch } from 'react-icons/md';
import { Input } from '@nextui-org/input';

export default function AppNavbar() {

    const { authenticateUser, isLogin, isAuthorized } = useLogin();
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session, status } = useSession();
    const [isPopOpen, setIsPopOpen] = React.useState(false);
    const [isAccOpen, setIsAccOpen] = React.useState(false);
    const [notificationPopup, setNotificationPopup] = React.useState(false);
    const [isLocked, setLocked] = useState(status === 'authenticated' && !sessionKey);
    const [searchModal, setSearchModal] = useState(false);


    // validate the local storage auth
    useMemo(() => {
        const credentials = getCredentials();

        if (status === 'authenticated') {
            if (!sessionKey) {
                setLocked(true);
            } else {
                setLocked(false);
            }
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
    }, [status, isAuthorized()]);


    function handleLogin() {
        authenticateUser();
    }

    function handleUnlock() {
        if (isLocked) {
            authenticateUser();
            if (isAuthorized()) {
                setLocked(false);
            }
        } else {
            saveSessionKey('');
            setLocked(true);
            toast.success('Locked');
        }


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
                <Link href={'/'} className='hidden max-sm:block max-xs:hidden'>
                    <Image priority className='hidden max-sm:block'
                        src={'/logo192.png'}
                        alt='logo'
                        height={40}
                        width={40}
                    />

                </Link>
            </NavbarBrand>


            <NavbarContent as="div" className="items-center z-0 " justify="end">
                <div className="flex flex-row gap-2 items-center ">

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
                        isReadOnly
                        onClick={() => setSearchModal(true)}
                        startContent={<MdSearch size={18} />}
                        type="search"
                    />

                    <button className='1md:hidden hover:bg-foreground/10 transition-all delay-100 rounded-full p-1'
                        onClick={(e) => {
                            setSearchModal(true)
                        }}>
                        <MdSearch className='text-xl text-default-600 ' />
                    </button>


                    <Link href='/submit'
                        className='hover:bg-foreground/10 transition-all delay-100 rounded-full p-1'
                    >
                        <LuPencilLine className='text-xl text-default-600' />
                    </Link>

                    {status === 'authenticated' &&
                        <Popover style={{
                            zIndex: 50,
                        }}
                            backdrop='opaque'
                        >
                            <PopoverTrigger >

                                <button
                                    className={`text-default-600 relative hover:bg-foreground/10 
                                    transition-all delay-100 rounded-full p-1 items-center`}
                                    aria-label="notifications bg-red-100"
                                >
                                    <Badge size='sm' content={loginInfo.unread_count > 99 ?
                                        '99+' : loginInfo.unread_count > 0 && loginInfo.unread_count}
                                        className='opacity-80' color='primary'>
                                        <FaRegBell className='text-xl text-default-600' />
                                    </Badge>
                                </button>

                            </PopoverTrigger>
                            <PopoverContent>
                                <NotificationsCard username={session?.user?.name} />
                            </PopoverContent>
                        </Popover>}

                    {status !== 'authenticated' &&
                        <div className=' items-center'>
                            <Button isIconOnly={status !== 'unauthenticated'}
                                className=' max-sm:hidden'
                                radius='lg' variant='flat' color='success'
                                onPress={handleLogin} size='sm'
                                isDisabled={status === 'loading'} isLoading={status === 'loading'}>
                                Login
                            </Button>

                            <button onClick={handleLogin}
                                type="button" className={`hidden max-sm:block text-white bg-success-700/20 hover:bg-success-800/50 focus:outline-none
                             rounded-lg text-sm px-4 py-1 text-center dark:bg-success-600/20 dark:hover:bg-success-700/50`}>Login</button>

                        </div>

                    }

                    {status === 'authenticated' &&
                        <Popover placement="top" color='default'
                            shouldCloseOnBlur={false}
                            isOpen={isPopOpen} onOpenChange={(open) => setIsPopOpen(open)}>
                            <PopoverTrigger>
                                <Button isIconOnly className='ms-2'
                                    radius='full' variant='light'>
                                    <Avatar src={getResizedAvatar(session?.user?.name ?? '')}
                                        className=' cursor-pointer'
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <ul tabIndex={0} className="menu menu-sm" onClick={() => {
                                    if (isPopOpen) setIsPopOpen(false);
                                }}>
                                    <li><Link href={`/@${session?.user?.name}`}>Profile</Link></li>
                                    <li><a onClick={() => setIsAccOpen(!isAccOpen)}>Switch Account</a></li>
                                    <li><a onClick={handleUnlock}> {isLocked ? 'Unlock' : 'Lock'} Account</a>
                                    </li>

                                </ul>
                            </PopoverContent>
                        </Popover>
                    }


                </div>

                {searchModal && <SearchModal isOpen={searchModal}
                    onOpenChange={setSearchModal} />}

                {isAccOpen &&
                    <AccountsModal isOpen={isAccOpen}
                        onOpenChange={setIsAccOpen} />
                }



            </NavbarContent>


        </Navbar>


    )
}
