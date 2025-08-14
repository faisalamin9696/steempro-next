import { Button } from "@heroui/button";
import React from 'react'
import { MdDisabledVisible } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from "@/utils/i18n";

interface Props {
    onOpen?: (open: boolean) => void;
    className?: string;
}

export default function NsfwOverlay(props: Props) {
    const { onOpen, className } = props;
    const { t } = useTranslation();

    return (
        <div className=" absolute self-center  items-center justify-center
        top-0 flex  flex-col h-full w-full  z-50 gap-2 bg-black/50 text-white">

            <Button 
                isIconOnly 
                size='sm' 
                variant='flat' 
                aria-label={t('common.show_nsfw_content')}
                onPress={() => {
                    onOpen && onOpen(true)
                }}>
                <MdDisabledVisible className={twMerge('text-xl', className)} />
            </Button>

        </div>
    )
}
