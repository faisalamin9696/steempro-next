import { FaQuoteLeft, FaItalic, FaBold, FaLink, FaHeading, FaCode } from 'react-icons/fa';
import { Button, Kbd, Tooltip } from '@nextui-org/react';
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from 'react-icons/lu';


import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/react";
import clsx from 'clsx';
import { BsImage, BsJustify, BsTextCenter } from 'react-icons/bs';
import { MdContentPasteGo } from 'react-icons/md';
import { ToolbarItem } from './component/EditorToolbarItem';



interface ToolbarProps {
    onSelect: any,
    style?: any;
    className?: string;

}
const EditorToolbar = (props: ToolbarProps) => {
    const { onSelect, className } = props;
    const masterKey = 'Alt + ';

    const HeadingItem = <Dropdown shadow='sm' size='sm' className='min-w-0'
        placement='bottom-end' >
        <DropdownTrigger>
            <Button isIconOnly size='sm'>
                <FaHeading className='text-lg rounded-none' />
            </Button>
        </DropdownTrigger>


        <DropdownMenu variant='faded' className='rounded-xl'
            onAction={(key) => {
                onSelect(key);
            }}>
            <DropdownItem key="h1" >
                <Tooltip content={`${masterKey + '1'}`}>
                    <div>
                        <LuHeading1 className="text-2xl" />
                    </div>
                </Tooltip>
            </DropdownItem>
            <DropdownItem key="h2" >
                <Tooltip content={`${masterKey + '2'}`}>

                    <div>
                        <LuHeading2 className="text-xl" />
                    </div>
                </Tooltip>
            </DropdownItem>
            <DropdownItem key="h3" >
                <Tooltip content={`${masterKey + '3'}`}>

                    <div>
                        <LuHeading3 className="text-lg" />
                    </div>
                </Tooltip>
            </DropdownItem>
            <DropdownItem key="h4" >
                <Tooltip content={`${masterKey + '4'}`}>

                    <div>
                        <LuHeading4 className="text-md" />
                    </div>
                </Tooltip>
            </DropdownItem>
        </DropdownMenu>
    </Dropdown>


    return (
        <div className={clsx(className)} >

            <div className="items-center space-x-1 flex overflow-auto">
                <Tooltip content={('Headings')}>
                    <div>{HeadingItem}
                    </div>
                </Tooltip>
                <ToolbarItem tooltip={{
                    description: 'Bold',
                    shortcut: `${masterKey + 'B'}`
                }} onSelect={() => { onSelect('b') }}
                    IconType={FaBold} />


                <ToolbarItem tooltip={{
                    description: 'Italic',
                    shortcut: `${masterKey + 'i'}`
                }} onSelect={() => { onSelect('i') }}
                    IconType={FaItalic} />



                <ToolbarItem tooltip={{
                    description: 'Quote',
                    shortcut: `${masterKey + 'Q'}`
                }} onSelect={() => { onSelect('q') }}
                    IconType={FaQuoteLeft} />

                <ToolbarItem tooltip={{
                    description: 'Code',
                    shortcut: `${masterKey + 'C'}`
                }} onSelect={() => { onSelect('code') }}
                    IconType={FaCode} />

                <div className='h-4 w-[1px] bg-default-900/20' />

                <ToolbarItem tooltip={{
                    description: 'Snippet',
                    shortcut: `${masterKey + 'S'}`
                }} onSelect={() => { onSelect('snip') }}
                    IconType={MdContentPasteGo} />

                <ToolbarItem tooltip={{
                    description: 'Link',
                    shortcut: `${masterKey + 'Q'}`
                }} onSelect={() => { onSelect('link') }}
                    IconType={FaLink} />

                <ToolbarItem tooltip={{
                    description: 'Image',
                    shortcut: `${masterKey + 'D'}`
                }} onSelect={() => { onSelect('image') }}
                    IconType={BsImage} />

                <div className='h-4 w-[1px] bg-default-900/20' />

                <ToolbarItem tooltip={{
                    description: 'Justify',
                    shortcut: `${masterKey + 'J'}`
                }} onSelect={() => { onSelect('justify') }}
                    IconType={BsJustify} />


                <ToolbarItem tooltip={{
                    description: 'Center',
                    shortcut: `${masterKey + 'E'}`
                }} onSelect={() => { onSelect('center') }}
                    IconType={BsTextCenter} />


            </div>
        </div >
    );
};


export default EditorToolbar;
