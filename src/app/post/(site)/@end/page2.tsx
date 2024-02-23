"use client"

import { Button } from '@nextui-org/react'
import React, { useState } from 'react'
import { IoIosRefresh } from 'react-icons/io'
import CompactPost from '../../../../components/CompactPost'
import useSWR from 'swr'
import { awaitTimeout, fetchSds } from '@/libs/constants/AppFunctions'
import LoadingCard from '@/components/LoadingCard'
import { Accordion, AccordionItem } from "@nextui-org/react";
import UserCard from '@/components/UserCard'
import ProfileEnd from '@/app/profile/(site)/@end/page'

type Props = {
  username: string;
}
export default function PostEnd2(props: Props) {
  const { username } = props;
  // const [offset, setOffset] = useState(0);
  // const [muting, setMuting] = useState(false);

  // const URL = `/feeds_api/getActivePostsByTagPayout/${tag}/null/250/5/${offset}`
  // const { data, mutate, isLoading, isValidating } = useSWR(muting ? null : URL, fetchSds<Feed[]>)

  // // const promotedList = ['faisalamin/photos-at-university-of-agriculture',
  // //   'faisalamin/steempro-tools-analytics-05-feb-2024',
  // //   'faisalamin/daily-activity-reports-overview-or-weekly-report34821415f6a65est']

  // async function handlePromotionRefresh() {
  //   setMuting(true);
  //   setOffset(offset + 2);
  //   await awaitTimeout(0.2)
  //   mutate();
  //   setMuting(false);
  // }


  return (
    <div className="flex flex-col rounded-lg pb-32">

      <ProfileEnd  />
      {/* 
      <Accordion defaultExpandedKeys={['end']}>
        <AccordionItem
          key="end" aria-label="Accordion 1"
          title={<div
            className="flex items-center gap-2 text-lg font-bold">
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
          </div>}>
          {isLoading || isValidating ? <LoadingCard /> :
            <div className='flex flex-col gap-4'>
              {data?.map((comment) => {
                return (
                  <CompactPost key={comment.permlink} comment={comment} />
                )
              })}
            </div>}
        </AccordionItem>
      </Accordion> */}
    </div >
  )
}
