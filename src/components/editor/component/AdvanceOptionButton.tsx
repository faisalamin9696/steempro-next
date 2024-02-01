import { Button, Tooltip } from '@nextui-org/react'
import React from 'react'
import { MdSettings } from 'react-icons/md'

export default function AdvanceOptionButton() {
    return (
        <Tooltip content='Beneficiaries' className='md:hidden'>

            <Button size='sm' color='default'
                startContent={<MdSettings className='text-lg' />}
                className='!text-white'
                radius='lg' variant='shadow'>
                Advance
            </Button>
        </Tooltip>
    )
}
