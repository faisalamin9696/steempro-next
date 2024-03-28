import { awaitTimeout, fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import { notFound } from 'next/navigation';
import React, { memo, useMemo, useState } from 'react'
import useSWR from 'swr';
import { Button } from '@nextui-org/button';
import InfiniteScroll from 'react-infinite-scroll-component';
import CommentCard from './comment/CommentCard';
import CommentSkeleton from './comment/components/CommentSkeleton';
import { getSettings } from '@/libs/utils/user';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';
import { twMerge } from 'tailwind-merge';
import EmptyList from './EmptyList';

interface Props {
    endPoint: string;
    className?: string;
}

export default memo(function FeedList(props: Props) {
    const { endPoint, className } = props;
    const { data, error, isLoading } = useSWR(endPoint, fetchSds<Feed[]>);
    const [rows, setRows] = useState<Feed[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const { isMobile } = useDeviceInfo();
    const isGridStyle = settings.feedStyle === 'grid' && !isMobile;


    useMemo(() => {
        if (data) {
            setRows(data.slice(0, 15));
        }

    }, [data]);


    function loadMoreRows(mainData: Feed[], rowsData: Feed[]) {
        let newStart = mainData?.slice(rowsData?.length ?? 0);
        const newRow = newStart?.slice(1, 15);
        return newRow ?? []
    };


    async function handleEndReached() {
        if (data) {
            setLoadingMore(true);
            await awaitTimeout(2.5);
            const newRows = loadMoreRows(data, rows);
            setRows([...rows, ...newRows!]);
            setLoadingMore(false);
        }
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
                onClick={handleEndReached} ></Button>
        </div>)
    }

    return <InfiniteScroll
        className='gap-2'
        dataLength={rows?.length}
        next={handleEndReached}
        hasMore={(rows?.length < (data?.length ?? 0))}
        loader={<ListLoader />}
        endMessage={
            <EmptyList />
        }>
        <div className={twMerge(isGridStyle ?
            (className ? className : "gap-6 grid 1lg:grid-cols-3  lg:grid-cols-2 md:grid-cols-2") : 'flex flex-col gap-2')}>

            {rows?.map((comment) => {
                return (!comment.link_id) ? null :
                    <CommentCard key={comment.link_id} comment={comment} />
            })}
        </div>
    </InfiniteScroll >
}
)