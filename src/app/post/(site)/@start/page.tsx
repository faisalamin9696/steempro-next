"use client";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Button } from "@nextui-org/button";
import React, { useState } from "react";
import { IoIosRefresh } from "react-icons/io";
import useSWR from "swr";
import LoadingCard from "@/components/LoadingCard";
import CompactPost from "@/components/CompactPost";
import {
  fetchSds,
  awaitTimeout,
  useAppSelector,
  useAppDispatch,
  getEndPoint,
} from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { GrBlog } from "react-icons/gr";
import { FeedBodyLength } from "@/libs/constants/AppConstants";
import { getSettings, updateSettings } from "@/libs/utils/user";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";

export default function PostStart() {
  const { username, permlink } = usePathnameClient();
  const [offset, setOffset] = useState(0);
  const [muting, setMuting] = useState(false);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();

  const dispatch = useAppDispatch();

  const { data, mutate, isLoading, isValidating } = useSWR(
    muting || !settings.readMore
      ? null
      : getEndPoint(
          "PostsByAuthor",
          `${username}/${loginInfo.name || "null"}`,
          FeedBodyLength,
          5,
          offset
        ),
    fetchSds<Feed[]>
  );

  async function handlePromotionRefresh() {
    setMuting(true);
    setOffset(offset + 2);
    await awaitTimeout(0.2);
    mutate();
    setMuting(false);
  }

  return (
    <div className="flex flex-col rounded-lg pb-32">
      <Accordion
        onExpandedChange={(keys) => {
          const newSetting = updateSettings({
            ...settings,
            readMore: !!keys?.size,
          });
          dispatch(updateSettingsHandler(newSetting));
        }}
        defaultExpandedKeys={settings.readMore ? ["end"] : []}
        isCompact
      >
        <AccordionItem
          startContent={<GrBlog className="text-primary text-xl" />}
          key="end"
          aria-label="posts"
          title={
            <div className="flex items-center gap-2 text-lg font-bold">
              <p className="text-medium font-semibold">{"Read more"}</p>
              <Button
                radius="full"
                variant="light"
                color="default"
                size="sm"
                onClick={handlePromotionRefresh}
                isIconOnly
              >
                <IoIosRefresh className="text-lg" />
              </Button>
            </div>
          }
        >
          {isLoading || isValidating ? (
            <LoadingCard />
          ) : (
            <div className="flex flex-col gap-2">
              {data
                ?.filter((item) => item.permlink !== permlink)
                .map((comment) => {
                  return (
                    <CompactPost key={comment.permlink} comment={comment} />
                  );
                })}
            </div>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// export default function PostStart() {

// const { data, error, mutate, isLoading, isValidating } = useSWR('annoucements', getAnnouncements);
// const annoucements = data?.['posts'];

// if (error) return <ErrorCard message={error?.message} onClick={mutate} />

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
//         onClick={handleRefresh}
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
