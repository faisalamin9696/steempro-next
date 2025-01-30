import { Button } from "@heroui/button";
import React from 'react'
import { MdDisabledVisible } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

interface Props {
    onOpen?: (open: boolean) => void;
    className?: string;
}

export default function NsfwOverlay(props: Props) {
    const { onOpen, className } = props;

    return (
        <div className=" absolute self-center  items-center justify-center
        top-0 flex  flex-col h-full w-full  z-50 gap-2 bg-black/50 text-white">

            <Button isIconOnly size='sm' variant='flat' onPress={() => {
                onOpen && onOpen(true)
            }}>
                <MdDisabledVisible className={twMerge('text-xl', className)} />
            </Button>

        </div>
    )
}
