'use client';

import React, { memo, useState } from 'react'
import DrawerItems from './DrawerItems'
import { Button } from '@nextui-org/button';
import { RxHamburgerMenu } from "react-icons/rx";
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import Image from 'next/image';
import ThemeSwitch from '../ThemeSwitch';
import { MdClose } from 'react-icons/md';


interface Props {
    onItemClick?: () => void;
    onAccountSwitch?: () => void;
}

export default memo(function AppDrawer(props: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { onItemClick, onAccountSwitch } = props;


    const toggleDrawer = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        document.body.classList.toggle('overflow-hidden', newState);

    };
    return (
        <div className='relative'>

            <button
                className="fixed inset-0 z-10 bg-black bg-opacity-50 min-h-screen transition-opacity"
                style={{ visibility: isOpen ? 'visible' : 'hidden', opacity: isOpen ? 1 : 0 }}
                onClick={toggleDrawer}
            ></button>

            {/* Drawer button */}
            <Button isIconOnly variant='light'
                className=""
                onClick={toggleDrawer}
            >
                <RxHamburgerMenu className='text-xl' />
            </Button>

            {/* Drawer content */}
            <div className={twMerge(`fixed z-50 top-0 left-0 h-screen w-64 p-1 rounded-r-2xl bg-background shadow-lg transition-transform duration-300 
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`)}  >

                <div className=' flex flewx-row items-center justify-between p-2'>
                    <div className=' flex items-center gap-2'>
                        <Link href={'/'}>
                            <Image
                                src={'/logo192.png'}
                                alt='logo'
                                height={40}
                                width={40}
                                style={{ width: 'auto' }}
                            />
                        </Link>

                        <ThemeSwitch />
                    </div>

                    <Button variant='light'
                        isIconOnly onPress={toggleDrawer}
                        radius='full' size='sm'>
                        <MdClose className='text-lg' />
                    </Button>


                </div>
                <DrawerItems onItemClick={toggleDrawer} {...props} />
            </div>
        </div>
    )
}
)
