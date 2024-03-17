'use client';

import React, { } from 'react'
import { FaArrowCircleLeft, FaInfoCircle, FaTools, FaUserCircle } from 'react-icons/fa';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import SAvatar from '../SAvatar';
import { signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { logoutHandler } from '@/libs/redux/reducers/LoginReducer';
import { abbreviateNumber } from '@/libs/utils/helper';
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from '../useLogin';
import Reputation from '../Reputation';
import Link from 'next/link';
import ThemeSwitch from '../ThemeSwitch';
import { PiUserSwitchFill } from "react-icons/pi";
import { RiUserStarFill } from "react-icons/ri";
import { getCredentials, getSessionKey, removeCredentials } from '@/libs/utils/user';
import { toast } from 'sonner';



interface Props {
    onItemClick?: () => void;
    onAccountSwitch?: () => void;

}
export default function DrawerItems(props: Props) {
    const { onItemClick, onAccountSwitch } = props;
    const dispatch = useAppDispatch();
    const { isLogin, authenticateUser, isAuthorized } = useLogin();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const posting_json_metadata = JSON.parse(loginInfo?.posting_json_metadata || '{}')
    const { isOpen, onOpenChange } = useDisclosure();

    function handleLogout() {
        authenticateUser();
        if (!isAuthorized()) {
            return
        }

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }
        onOpenChange();
        removeCredentials(credentials);
        dispatch(logoutHandler());
        signOut();
        toast.success(`${credentials.username} logged out successfully`);
    }


    return (<div className="flex flex-col gap-4 w-fit h-full justify-between overflow-y-auto scrollbar-thin">
        <>
            {isLogin() ?
                <div className='flex flex-col gap-4 py-6 rounded-bl-xl '>
                    <div className='flex flex-row gap-2 items-center'>
                        <SAvatar size='sm' username={loginInfo.name} />
                        <div className='flex flex-col items-start text-sm text-default-600'>

                            <h4>{posting_json_metadata?.profile?.name}</h4>

                            <div className='flex gap-2'>
                                <h4>@{loginInfo.name}</h4>
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
                    as={Link} href={`/@${loginInfo.name}`}
                    onClick={onItemClick}
                    startContent={<FaUserCircle className='text-xl' />}>
                    Profile
                </Button>}

                {isLogin() && <Button className='w-full justify-start text-inherit '
                    variant='light'
                    onPress={() => {
                        onAccountSwitch && onAccountSwitch();
                        onItemClick && onItemClick();
                    }
                    }
                    startContent={<PiUserSwitchFill className='text-xl' />}>
                    Switch Account
                </Button>}

                < Button variant='light'
                    as={Link} href={`/settings`}
                    className='w-full justify-start text-inherit '
                    onClick={onItemClick}
                    startContent={<IoMdSettings className='text-xl' />}>
                    Settings
                </Button>

                <Button variant='light'
                    className='w-full justify-start text-inherit '
                    as={Link} href={`/witnesses`}
                    onClick={onItemClick}
                    startContent={<RiUserStarFill className='text-xl' />}>
                    Witnesses
                </Button>

                <Button variant='light'
                    as={Link}
                    href='https://hivelearners-bcd3c.web.app'
                    target='_blank'
                    className='w-full justify-start text-inherit '
                    onClick={onItemClick}
                    startContent={<FaTools className='text-xl' />}>
                    Tools
                </Button>


                <Button variant='light'
                    className='w-full justify-start text-inherit '
                    as={Link} href={'/about'}
                    onClick={onItemClick}
                    startContent={<FaInfoCircle className='text-xl' />}>
                    About
                </Button>
                {isLogin() &&
                    < Button className='w-full justify-start text-danger '
                        variant='light'
                        onPress={() => {
                            authenticateUser();
                            if (!isAuthorized()) {
                                return
                            }
                            onOpenChange();
                        }}
                        startContent={<IoLogOut className='text-xl text-default-600' />}>
                        Logout
                    </Button>}
            </div>
        </>

        <div className='flex justify-between'>
            <ThemeSwitch />
            <Button variant='light' isIconOnly onPress={onItemClick}
                radius='full' size='sm'>
                <FaArrowCircleLeft className='text-xl' />
            </Button>
        </div>


        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' closeButton>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Confirmation</ModalHeader>
                        <ModalBody>
                            <p>Do you really want to logout {loginInfo.name}?</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="danger" onPress={handleLogout}>
                                Logout
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </div >


    )
}
