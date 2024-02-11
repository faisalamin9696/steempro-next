"use client"

import { Button } from '@nextui-org/react'
import React, { useState } from 'react'
import { IoIosRefresh } from 'react-icons/io'
import CompactPost from '../../_components/CompactPost'
import useSWR from 'swr'
import { awaitTimeout, fetchSds } from '@/libs/constants/AppFunctions'
import LoadingCard from '@/components/LoadingCard'

type Props = {
  tag: string;
}
export default function PostEnd(props: Props) {
  const { tag } = props;
  const [offset, setOffset] = useState(0);
  const [muting, setMuting] = useState(false);

  const URL = `/feeds_api/getActivePostsByTagPayout/${tag}/null/250/5/${offset}`
  const { data, mutate, isLoading, isValidating } = useSWR(muting ? null : URL, fetchSds<Feed[]>)

  // const promotedList = ['faisalamin/photos-at-university-of-agriculture',
  //   'faisalamin/steempro-tools-analytics-05-feb-2024',
  //   'faisalamin/daily-activity-reports-overview-or-weekly-report34821415f6a65est']

  async function handlePromotionRefresh() {
    setMuting(true);
    setOffset(offset + 2);
    await awaitTimeout(0.2)
    mutate();
    setMuting(false);
  }


  return (
    <div className="flex flex-col rounded-lg pb-32">

      <div
        className="flex items-center gap-2
       text-default-900 text-lg font-bold mb-4 ">
        <p>{'Related'}</p>
        <Button radius='full'
          variant='light'
          color='default'
          size='sm'
          onPress={handlePromotionRefresh}
          isIconOnly>
          <IoIosRefresh
            className='text-lg' />
        </Button>
      </div>

      {isLoading || isValidating ? <LoadingCard /> :
        <div className='flex flex-col gap-4'>
          {data?.map((comment) => {
            return (
              <CompactPost comment={comment} />
            )
          })}
        </div>}



    </div >
  )
}
