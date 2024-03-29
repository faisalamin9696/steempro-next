import { FaQuoteLeft, FaItalic, FaBold, FaLink, FaHeading, FaCode, FaTable } from 'react-icons/fa';
import { Button } from '@nextui-org/button';

import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from 'react-icons/lu';

import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/dropdown";
import clsx from 'clsx';
import { BsImage, BsJustify, BsTextCenter } from 'react-icons/bs';
import { ToolbarItem } from './EditorToolbarItem';



interface ToolbarProps {
    onSelect: any,
    style?: any;
    className?: string;
    isDisabled?: boolean;

}
const EditorToolbar = (props: ToolbarProps) => {
    const { onSelect, className, isDisabled } = props;
    const masterKey = 'Alt + ';

    const HeadingItem = <Dropdown aria-labelledby='toolbar' isDisabled={isDisabled} shadow='sm' size='sm' className='min-w-0'
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
                <div title={`${masterKey + '1'}`}>
                    <LuHeading1 className="text-2xl" />
                </div>
            </DropdownItem>
            <DropdownItem key="h2" >
                <div title={`${masterKey + '2'}`}>
                    <LuHeading2 className="text-xl" />
                </div>
            </DropdownItem>
            <DropdownItem key="h3" >

                <div title={`${masterKey + '3'}`}>
                    <LuHeading3 className="text-lg" />
                </div>
            </DropdownItem>
            <DropdownItem key="h4" >
                <div title={`${masterKey + '4'}`}>
                    <LuHeading4 className="text-md" />
                </div>
            </DropdownItem>
        </DropdownMenu>
    </Dropdown>


    return (
        <div className={clsx(className)} >

            <div className="flex flex-row items-center max-sm:flex-col max-sm:items-start w-full gap-1 max-sm:gap-2 overflow-auto">
                <div className=' flex gap-1 items-center'>
                    <div title='Headings'>{HeadingItem}
                    </div>
                    <ToolbarItem tooltip={{
                        description: 'Bold',
                        shortcut: `${masterKey + 'B'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('b') }}
                        IconType={FaBold} />


                    <ToolbarItem tooltip={{
                        description: 'Italic',
                        shortcut: `${masterKey + 'i'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('i') }}
                        IconType={FaItalic} />

                    <ToolbarItem tooltip={{
                        description: 'Quote',
                        shortcut: `${masterKey + 'Q'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('q') }}
                        IconType={FaQuoteLeft} />

                    <ToolbarItem tooltip={{
                        description: 'Code',
                        shortcut: `${masterKey + 'C'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('code') }}
                        IconType={FaCode} />

                    <ToolbarItem tooltip={{
                        description: 'Table',
                        shortcut: `${masterKey + 'T'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('table') }}
                        IconType={FaTable} />

                    <div className='h-4 w-[1px] bg-default-900/20' />

                    {/* <ToolbarItem tooltip={{
                        description: 'Snippet',
                        shortcut: `${masterKey + 'S'}`
                    }} isDisabled={isDisabled}
                    onSelect={() => { onSelect('snip') }}
                        IconType={MdContentPasteGo} /> */}

                    <ToolbarItem tooltip={{
                        description: 'Link',
                        shortcut: `${masterKey + 'Q'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('link') }}
                        IconType={FaLink} />

                    <ToolbarItem tooltip={{
                        description: 'Image',
                        shortcut: `${masterKey + 'D'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('image') }}
                        IconType={BsImage} />

                    <div className='max-sm:hidden h-4 w-[1px] bg-default-900/20' />
                </div>
                <div className='flex gap-1 items-center'>
                    <ToolbarItem tooltip={{
                        description: 'Justify',
                        shortcut: `${masterKey + 'J'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('justify') }}
                        IconType={BsJustify} />


                    <ToolbarItem tooltip={{
                        description: 'Center',
                        shortcut: `${masterKey + 'E'}`
                    }} isDisabled={isDisabled}
                        onSelect={() => { onSelect('center') }}
                        IconType={BsTextCenter} />

                </div>

            </div>
        </div >
    );
};


export default EditorToolbar;
