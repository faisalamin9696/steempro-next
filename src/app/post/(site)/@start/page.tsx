"use client"

import { Accordion, AccordionItem } from '@nextui-org/accordion';
import { Button } from '@nextui-org/button';
import React, { useState } from 'react';
import { IoIosRefresh } from 'react-icons/io';
import useSWR from 'swr';
import LoadingCard from '@/components/LoadingCard';
import CompactPost from '@/components/CompactPost';
import { fetchSds, awaitTimeout, useAppSelector } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { GrBlog } from "react-icons/gr";


export default function PostStart() {
  const { username, permlink } = usePathnameClient();
  const [offset, setOffset] = useState(0);
  const [muting, setMuting] = useState(false);
  const loginInfo = useAppSelector(state => state.loginReducer.value);


  const URL = `/feeds_api/getPostsByAuthor/${username}/${loginInfo.name || 'null'}/250/5/${offset}`
  const { data, mutate, isLoading, isValidating } = useSWR(muting ? null : URL, fetchSds<Feed[]>)

  async function handlePromotionRefresh() {
    setMuting(true);
    setOffset(offset + 2);
    await awaitTimeout(0.2)
    mutate();
    setMuting(false);
  }


  return (
    <div className="flex flex-col rounded-lg pb-32">


      <Accordion defaultExpandedKeys={['end']}>
        <AccordionItem
          startContent={<GrBlog   className="text-primary text-xl" />}
          key="end" aria-label="posts"
          title={<div
            className="flex items-center gap-2 text-lg font-bold">
            <p>{'Read more'}</p>
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
              {data?.filter(item => item.permlink !== permlink).map((comment) => {
                return (
                  <CompactPost key={comment.permlink} comment={comment} />
                )
              })}
            </div>}
        </AccordionItem>
      </Accordion>
    </div >
  )
}

// export default function PostStart() {

// const { data, error, mutate, isLoading, isValidating } = useSWR('annoucements', getAnnouncements);
// const annoucements = data?.['posts'];

// if (error) return <ErrorCard message={error?.message} onPress={mutate} />


// function handleRefresh() {
//   mutate();
// }

// return (
//   <div className="flex flex-col rounded-lg pb-32">

//     <div
//       className="flex items-center gap-2
//      text-default-900 text-lg font-bold mb-4
//       z-10 sticky top-0
//       backdrop-blur-lg">
//       <p>{'Announcements'}</p>
//       <Button radius='full'
//         color='default'
//         variant='light'
//         size='sm'
//         onPress={handleRefresh}
//         isIconOnly>
//         <IoIosRefresh
//           className='text-lg' />
//       </Button>
//     </div>
//     {isLoading || isValidating ? <LoadingCard /> :
//       <div className='flex flex-col gap-4'>
//         {annoucements?.map(annoucement => {
//           return (<div key={annoucement.authPerm} className='bg-white dark:bg-white/5 text-sm px-2 py-1'>
//             <Link className=' text-blue-400 hover:underline'
//               href={annoucement.authPerm}>{annoucement.title}</Link>
//             <p className='opacity-75 text-tiny'>
//               {annoucement.description}
//             </p>

//           </div>
//           )
//         })}
//       </div>}



//   </div >
// )
// }
