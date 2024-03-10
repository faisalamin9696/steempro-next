'use client';

import React, { useEffect, useState } from 'react'
import { FaInfoCircle, FaTools, FaUserCircle } from 'react-icons/fa';
import { Button } from '@nextui-org/react';
import ThemeSwitch from '../ThemeSwitch';
import SAvatar from '../SAvatar';
import { signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import secureLocalStorage from 'react-secure-storage';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { usePathname } from 'next/navigation';
import { abbreviateNumber, pushWithCtrl } from '@/libs/utils/helper';
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from '../useLogin';
import { empty_profile } from '@/libs/constants/Placeholders';
import Reputation from '../Reputation';
import { useRouter } from 'next13-progressbar';



interface Props {
    onItemClick?: () => void;
}
export default function NavbarDrawerItems(props: Props) {
    const { onItemClick } = props;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { credentials, isLogin } = useLogin();
    const loginInfo = useAppSelector(state => state.loginReducer.value) ?? empty_profile(credentials?.username ?? '');
    const posting_json_metadata = JSON.parse(loginInfo?.posting_json_metadata || '{}')

    function handleItemClick() {
        onItemClick && onItemClick();
    }


    function handleLogout() {
        signOut();
        secureLocalStorage.removeItem('auth');
        dispatch(saveLoginHandler({ ...loginInfo, login: false }));
    }


    return (<div className="flex flex-col gap-4 w-fit h-full">

        {isLogin() ?
            <div className='flex flex-col gap-4 py-6 rounded-bl-xl '>
                <div className='flex flex-row gap-2 items-center'>
                    <SAvatar size='sm' username={credentials?.username ?? ''} />
                    <div className='flex flex-col items-start text-sm text-default-600'>

                        <h4>{posting_json_metadata?.profile?.name}</h4>

                        <div className='flex gap-2'>
                            <h4>@{credentials?.username}</h4>
                            <Reputation sm reputation={79} />
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


        <div className='flex flex-col gap-2 h-full text-default-600 '>
            {isLogin() && <Button className='w-full justify-start text-inherit '
                variant='light'
                onPress={(event) => {
                    handleItemClick();
                    if (credentials?.username)
                        pushWithCtrl(event, router, `/@${credentials.username}`)
                }}
                startContent={<FaUserCircle className='text-xl' />}>
                Profile
            </Button>}

            <Button variant='light'
                className='w-full justify-start text-inherit '
                startContent={<FaTools className='text-xl' />}>
                Tools
            </Button>

            {isLogin() && < Button variant='light'
                onPress={() => {
                    handleItemClick();
                    router.push(`@${credentials?.username}/settings`);
                }}
                className='w-full justify-start text-inherit '
                startContent={<IoMdSettings className='text-xl' />}>
                Settings
            </Button>
            }
            <Button variant='light'
                className='w-full justify-start text-inherit '
                onPress={() => {
                    handleItemClick();
                    router.push('/about');
                }}
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


    </div>


    )
}
