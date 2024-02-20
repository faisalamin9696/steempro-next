"use client"

import { Button } from '@nextui-org/react'
import React from 'react'
import { IoIosRefresh } from 'react-icons/io'
import { getAnnouncements } from '@/libs/firebase/firebaseApp'
import useSWR from 'swr'
import ErrorCard from '@/components/ErrorCard'
import Link from 'next/link'
import LoadingCard from '@/components/LoadingCard'

export default function PostStart() {

  const { data, error, mutate, isLoading, isValidating } = useSWR('annoucements', getAnnouncements);
  const annoucements = data?.['posts'];

  if (error) return <ErrorCard message={error?.message} onPress={mutate} />


  function handleRefresh() {
    mutate();
  }

  return (
    <div className="flex flex-col rounded-lg pb-32">

      <div
        className="flex items-center gap-2
       text-default-900 text-lg font-bold mb-4
        z-10 sticky top-0
        backdrop-blur-lg">
        <p>{'Announcements'}</p>
        <Button radius='full'
          color='default'
          variant='light'
          size='sm'
          onPress={handleRefresh}
          isIconOnly>
          <IoIosRefresh
            className='text-lg' />
        </Button>
      </div>
      {isLoading || isValidating ? <LoadingCard /> :
        <div className='flex flex-col gap-4'>
          {annoucements?.map(annoucement => {
            return (<div key={annoucement.authPerm} className='bg-white dark:bg-white/5 text-sm px-2 py-1'>
              <Link className=' text-blue-400 hover:underline'
                href={annoucement.authPerm}>{annoucement.title}</Link>
              <p className='opacity-75 text-tiny'>
                {annoucement.description}
              </p>

            </div>
            )
          })}
        </div>}



    </div >
  )
}
