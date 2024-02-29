"use client"

import CommunityCard from "@/components/CommunityCard";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { fetchSds } from "@/libs/constants/AppFunctions";
import { getAnnouncements } from "@/libs/firebase/firebaseApp";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { IoIosRefresh } from "react-icons/io";
import useSWR from "swr";

export default function HomeStart() {

    const { data: session } = useSession();
    const { data, error, mutate, isLoading, isValidating } = useSWR('annoucements', getAnnouncements);
    const annoucements = data?.['posts'];

    const URL = `/communities_api/getCommunitiesByRank/${session?.user?.name || null}`;
    let { data: allCommunities, isLoading: isCommunitiesLoading,
        error: communitiesError, mutate: mutateCommunities } = useSWR(URL, fetchSds<Community[]>);

    const index = allCommunities?.findIndex(account => account.account === ('hive-160125'));
    
    if (index && index !== -1) {
        const officialCommunity = allCommunities?.splice(index, 1)[0];
        if (officialCommunity)
            allCommunities?.unshift(officialCommunity);
    }

    if (error) return


    function handleRefresh() {
        mutate();
    }

    return (
        <div className="flex flex-col rounded-lg gap-4 max-h-screen">
            <div>
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
                    error ? <ErrorCard message={error?.message} onPress={mutate} /> :
                        <div className='flex flex-col gap-4'>
                            {annoucements?.map(annoucement => {
                                return (<div key={annoucement.authPerm} className='bg-white dark:bg-white/5 text-sm px-2 py-1'>
                                    <Link className=' text-blue-400 hover:underline'
                                        href={annoucement.authPerm}>{annoucement.title}</Link>
                                    <p className='opacity-75 text-sm line-clamp-3'>
                                        {annoucement.description}
                                    </p>

                                </div>
                                )
                            })}
                        </div>}

            </div>

            <div>
                <div
                    className="flex items-center gap-2
     text-default-900 text-lg font-bold mb-4
      z-10 sticky top-0
      backdrop-blur-lg">
                    <p>{'Communities'}</p>
                    {/* <Button radius='full'
                        color='default'
                        variant='light'
                        size='sm'
                        onPress={handleRefresh}
                        isIconOnly>
                        <IoIosRefresh
                            className='text-lg' />
                    </Button> */}
                </div>

                {isCommunitiesLoading ? <LoadingCard /> :
                    communitiesError ? <ErrorCard message={communitiesError?.message} onPress={mutateCommunities} /> :
                        <div className='flex flex-col gap-4'>
                            {allCommunities?.map(community => {
                                return (<CommunityCard community={community} compact />
                                )
                            })}
                        </div>}

            </div>

        </div >
    )
}
