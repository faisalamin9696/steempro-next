'use client';

import React, { } from 'react'
import { FaInfoCircle, FaTools, FaUserCircle } from 'react-icons/fa';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import { signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { logoutHandler } from '@/libs/redux/reducers/LoginReducer';
import { IoLogOut } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useLogin } from '../../AuthProvider';
import Link from 'next/link';
import { PiUserSwitchFill } from "react-icons/pi";
import { RiUserStarFill } from "react-icons/ri";
import { getCredentials, getSessionKey, removeCredentials } from '@/libs/utils/user';
import { toast } from 'sonner';
import { HiMiniUserGroup } from 'react-icons/hi2';

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


    return (<div className="flex flex-col gap-4 w-full h-full justify-between overflow-y-auto scrollbar-thin">
        <>


            <div className='flex flex-col gap-2 h-full text-default-600'>
                {isLogin() && <Button className='w-full justify-start text-inherit '
                    variant='light'
                    as={Link} href={`/@${loginInfo.name}`}
                    onClick={onItemClick}
                    startContent={<FaUserCircle className='text-xl' />}>
                    Profile
                </Button>}

                {isLogin() && <Button className='w-full justify-start text-inherit '
                    variant='light'
                    onClick={() => {
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
                    as={Link} href={`/communities`}
                    onClick={onItemClick}
                    startContent={<HiMiniUserGroup className='text-xl' />}>
                    Communities
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
                        onClick={() => {
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




        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' closeButton>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Confirmation</ModalHeader>
                        <ModalBody>
                            <p>Do you really want to logout {loginInfo.name}?</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" variant="light" onClick={onClose}>
                                Close
                            </Button>
                            <Button color="danger" onClick={handleLogout}>
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