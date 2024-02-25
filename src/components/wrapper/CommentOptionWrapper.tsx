import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import React from 'react'
import { MdSettings } from 'react-icons/md'

type Props = {
    children: React.ReactNode;
    advance?: boolean;
}

export default function CommentOptionWrapper(props: Props) {
    const { children, advance } = props;
    return (
        advance ?
            <Popover
                placement={'top-start'} className=' ' classNames={{
                    content: ''
                }}>
                <PopoverTrigger  >
                    <Button size='sm' color='default'
                        startContent={<MdSettings className='text-lg' />}
                        radius='lg' variant='shadow'>
                        Advance
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="flex flex-row gap-4">
                        {children}

                    </div>
                </PopoverContent>

            </Popover>
            : children
    )
}
