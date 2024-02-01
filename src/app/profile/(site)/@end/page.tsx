"use client"

import React from 'react'
import UserCard from '@/components/UserCard'
import { empty_comment } from '@/libs/constants/Placeholders'
import { Button, Card } from '@nextui-org/react'
import { IoIosRefresh } from "react-icons/io";

const cards = [
  { id: 1, content: 'Card 1' },
  { id: 2, content: 'Card 2' },
  { id: 3, content: 'Card 3' },
]


export default function ProfileEnd() {
  return (
    <div className="flex flex-col">

      <div
        className="flex items-center gap-2
         text-default-900 text-lg font-bold mb-4 z-10">
        <p>Intresting People</p>
        <Button radius='full'
          color='default'
          size='sm'
          isIconOnly>
          <IoIosRefresh className='text-lg' />
        </Button>
      </div>

      <div className='flex flex-col gap-6 '>
        <Card className='border border-gray-100/10 shadow-md shadow-secondary-900 bg-transparent backdrop-blur-md'>
          <UserCard compact comment={empty_comment('steemchiller', '')} />
        </Card>

        <Card>
          <UserCard compact comment={empty_comment('donekim', '')} />
        </Card>
        <Card>
          <UserCard compact comment={empty_comment('justyy', '')} />
        </Card>
        <Card>
          <UserCard compact comment={empty_comment('rme', '')} />
        </Card>



      </div>
    </div>

  )
}
