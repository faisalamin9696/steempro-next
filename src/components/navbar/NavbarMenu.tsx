import { Link } from '@nextui-org/react';
import React, { useEffect, useRef } from 'react'

interface Props {
    isOpen: boolean;
    onClickOutside?: () => void;

}
export default function HeaderMenu(props: Props) {
    const { isOpen, onClickOutside } = props;
    const ref = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClickOutside && onClickOutside();
            }
        };
        window.addEventListener('click', handleClickOutside, true);
        return () => {
            window.removeEventListener('click', handleClickOutside, true);
        };
    }, [onClickOutside]);

    if (!isOpen)
        return null;

    else return <div ref={ref} className='bg-white absolute right-0 z-10 mt-4 w-48 origin-top-right rounded-md'>
        <ul className='block px-4 py-2 text-sm space-y-2' >
            <ul>
                <Link  href="#" className='text-black'>
                    Your Profile
                </Link>

            </ul>
            <ul>
                <Link  href="#" className='text-black'>
                    Settings
                </Link>

            </ul>
            <ul>
                <Link  href="#" className='text-black'>
                    Sign out
                </Link>

            </ul>
        </ul>
    </div>
}
