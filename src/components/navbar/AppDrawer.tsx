'use client';

import React, { memo, useEffect, useMemo, useState } from 'react'
import DrawerItems from './DrawerItems'
import { Button, ButtonGroup } from '@nextui-org/react';
import { RxHamburgerMenu } from "react-icons/rx";
import ThemeSwitch from '../ThemeSwitch';
import { IoClose } from 'react-icons/io5';
import { FaArrowCircleLeft } from 'react-icons/fa';


export default memo(function AppDrawer() {
    const [isOpen, setIsOpen] = useState(false);

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
            <div
                className={`fixed z-50 top-0 left-0 h-screen w-60 bg-background shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}  >
                <div className='p-4 justify-between h-full flex flex-col'>
                    <DrawerItems />
                    <div className='flex justify-between'>

                        <ThemeSwitch />
                        <Button variant='light' isIconOnly onPress={toggleDrawer}
                            radius='full' size='sm'>
                            <FaArrowCircleLeft className='text-xl' />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}
)
