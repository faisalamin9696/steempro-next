import { awaitTimeout, fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import { notFound } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import useSWR from 'swr';
import { Button } from '@nextui-org/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CommentCard from './CommentCard';
import CommentSkeleton from './component/CommentSkeleton';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';
import { useMobile } from '@/libs/utils/useMobile';

type Props = {
    endPoint: string;
}

export default function FeedList(props: Props) {
    const { endPoint } = props;
    const { data, error, isLoading, mutate, isValidating } = useSWR(endPoint, fetchSds);
    const [rows, setRows] = useState<Feed[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const isMobile = useMobile();


    useMemo(() => {
        if (data) {
            setRows(data.slice(0, 7));
        }

    }, [data])


    function loadMoreRows(mainData: Feed[], rowsData: Feed[]) {
        let newStart = mainData?.slice(rowsData?.length ?? 0);
        const newRow = newStart?.slice(1, 7);
        return newRow ?? []
    };


    async function handleEndReached() {
        setLoadingMore(true);
        await awaitTimeout(2.5);
        const newRows = loadMoreRows(data, rows);
        setRows([...rows, ...newRows!])
        setLoadingMore(false);
    }


    if (isLoading)
        return <div className='flex flex-col space-y-2'>
            <CommentSkeleton />
            <CommentSkeleton />
        </div>

    if (error) return notFound();



    function ListLoader(): JSX.Element {
        return (<div className='flex justify-center items-center'>
            <Button color='default'
                variant='light'
                className='self-center'
                isIconOnly
                isLoading={loadingMore}
                isDisabled
                onPress={handleEndReached} ></Button>
        </div>)
    }

    return (
        <InfiniteScroll
            className='gap-2'
            dataLength={rows?.length}
            next={handleEndReached}
            hasMore={true}
            loader={<ListLoader />}
            endMessage={
                <p style={{ textAlign: "center" }}>
                    <b>Yay! You have seen it all</b>
                </p>
            }>
            <div className={clsx(settings.feedStyle === 'grid' &&
                !isMobile && "grid gap-6 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2")}>
                {rows?.map((comment) => {
                    return <CommentCard key={comment.link_id} comment={comment} />
                })}
            </div>
        </InfiniteScroll >
    )
}
