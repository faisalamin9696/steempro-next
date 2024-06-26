"use client"

import CommunityCard from "@/components/community/CommunityCard";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { awaitTimeout, fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { getAnnouncements } from "@/libs/firebase/firebaseApp";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Button } from "@nextui-org/button";

import Link from "next/link";
import { GrAnnounce } from "react-icons/gr";
import useSWR from "swr";
import { HiMiniUserGroup } from "react-icons/hi2";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyList from "@/components/EmptyList";

export default function HomeStart() {

    const { data, error, mutate, isLoading, isValidating } = useSWR('annoucements', getAnnouncements);
    const annoucements = data?.['posts'];
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const URL = `/communities_api/getCommunitiesByRank/${loginInfo.name || null}/50`;
    let { data: allCommunities, isLoading: isCommunitiesLoading,
        error: communitiesError, mutate: mutateCommunities } = useSWR(URL, fetchSds<Community[]>);


    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState<Community[]>([]);
    const [rows, setRows] = useState<Community[]>(allCommunities ?? []);
    const [loadingMore, setLoadingMore] = useState(false);


    if (error) return


    useEffect(() => {
        const timeout = setTimeout(() => {
            if (rows) {
                setFilteredData(rows.filter(community =>
                    (community.account.includes(query.toLowerCase())) ||
                    (community.title.includes(query.toLowerCase()))));
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [query, rows]);

    useEffect(() => {
        if (allCommunities) {
            setRows(allCommunities.slice(0, 20));
        }

    }, [allCommunities]);



    function loadMoreRows(mainData: Community[], rowsData: Community[]) {
        let newStart = mainData?.slice(rowsData?.length ?? 0);
        const newRow = newStart?.slice(0, 20);
        return newRow ?? []
    };



    async function handleEndReached() {
        if (allCommunities) {
            setLoadingMore(true);
            await awaitTimeout(2.5);
            const newRows = loadMoreRows(allCommunities, rows);
            setRows([...rows, ...newRows!])
            setLoadingMore(false);
        }
    }

    function ListLoader(): JSX.Element {
        return (<div className='flex justify-center items-center'>
            <Button color='default'
                variant='light'
                className='self-center'
                isIconOnly
                isLoading={loadingMore}
                isDisabled
                onClick={handleEndReached} ></Button>
        </div>)
    }

    return (
        <div className="flex flex-col rounded-lg gap-4">
            <div>
                <div
                    className={`flex items-center gap-2 text-default-900 text-lg 
                    font-bold mb-4 z-10 sticky top-0 backdrop-blur-lg`}>
                    <GrAnnounce className="text-primary text-xl" />

                    <p>{'Announcements'}</p>
                    {/* <Button radius='full'
                        color='default'
                        variant='light'
                        size='sm'
                        onClick={handleRefresh}
                        isIconOnly>
                        <IoIosRefresh
                            className='text-lg' />
                    </Button> */}
                </div>

                {isLoading || isValidating ? <LoadingCard /> :
                    error ? <ErrorCard message={error?.message} onClick={mutate} /> :
                        <div className='flex flex-col gap-4'>
                            {annoucements?.map(annoucement => {
                                return (<div key={annoucement.authPerm}
                                    className='bg-white rounded-lg dark:bg-white/5 text-sm px-2 py-1'>
                                    <Link className=' text-blue-400 hover:underline'
                                        href={`/@${annoucement.authPerm}`}>{annoucement.title}</Link>
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
                    className={`flex items-center gap-2 text-default-900 text-lg 
                    font-bold mb-4 z-10 sticky top-0 backdrop-blur-lg`}>
                    <HiMiniUserGroup className="text-primary text-xl" />

                    <Link href={'/communities'}>{'Top Communities'}</Link>
                    {/* <Button radius='full'
                        color='default'
                        variant='light'
                        size='sm'
                        onClick={handleRefresh}
                        isIconOnly>
                        <IoIosRefresh
                            className='text-lg' />
                    </Button> */}
                </div>

                {isCommunitiesLoading ? <LoadingCard /> :
                    communitiesError ? <ErrorCard message={communitiesError?.message} onClick={mutateCommunities} /> :
                        <ScrollShadow id="scrollableDiv"
                            style={{
                                height: 280,
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            className='flex flex-col gap-4 scrollbar-thin'>
                            <InfiniteScroll
                                className='gap-2  px-1 pb-1'
                                dataLength={filteredData?.length}
                                next={handleEndReached}
                                hasMore={(filteredData?.length < (allCommunities?.length ?? 0))}
                                scrollableTarget="scrollableDiv"
                                loader={<ListLoader />}
                                endMessage={
                                    <EmptyList />
                                }>
                                <div className="flex flex-col gap-2">
                                    {filteredData?.map(community => {
                                        return (<CommunityCard key={community.id} community={community} compact />
                                        )
                                    })}
                                </div>
                            </InfiniteScroll >


                        </ScrollShadow>}

            </div>

        </div >
    )
}
