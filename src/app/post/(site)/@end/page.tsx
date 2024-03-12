"use client"

import React, { useEffect, useState } from 'react'
import { Button, Card } from '@nextui-org/react'
import { filterRecommendations, mapSds } from '@/libs/constants/AppFunctions'
import UserCard from '@/components/UserCard'
import { IoIosRefresh } from 'react-icons/io'
import usePathnameClient from '@/libs/utils/usePathnameClient'
import { useSession } from 'next-auth/react'


export default function PostEnd() {
  const { username } = usePathnameClient();
  const { data: session } = useSession();

  const [recomendations, setRecomendations] = useState<string[]>([]);
  let followingList = [username].concat([session?.user?.name || ''])

  useEffect(() => {
    followingList = [username].concat([session?.user?.name || '']);
    setRecomendations(filterRecommendations(followingList));
  }, []);


  function handlePeopleRefresh() {
    setRecomendations(filterRecommendations(followingList));
  }



  return (
    <div className="flex flex-col pb-60 ">

      <div className='sticky top-0 z-10 backdrop-blur-lg'>
        <div
          className="flex items-center gap-2
         text-default-900 text-lg font-bold mb-4 z-10">
          <p>{'Intresting People'}</p>
          <Button radius='full' variant='light'
            color='default'
            size='sm'
            onPress={handlePeopleRefresh}
            isIconOnly>
            <IoIosRefresh
              className='text-lg' />
          </Button>
        </div>
      </div>


      <div className='flex flex-col gap-2 px-1 pb-1'>
        {recomendations?.map(people => {
          return <Card className='border compact border-gray-100/10 shadow-md shadow-gray-400 dark:shadow-default-500 bg-transparent backdrop-blur-md'>
            <UserCard compact username={people} />
          </Card>
        })}
      </div>
    </div>


  )
}
