"use client"

import ErrorCard from '@/components/ErrorCard';
import LoadingCard from '@/components/LoadingCard';
import RoleCard from '@/components/RoleCard';
import { awaitTimeout, fetchSds } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient'
import { Button, Card, Input } from '@nextui-org/react'
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa';
import { IoIosRefresh } from 'react-icons/io'
import InfiniteScroll from 'react-infinite-scroll-component';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

interface Props {
    large?: boolean;
    roles?: Role[];
    stickyHeader?: boolean;
}
export default function CommunityRoles(props: Props) {
    const { community } = usePathnameClient();
    const { large, roles, stickyHeader } = props;
    
    const URL = `/communities_api/getCommunityRoles/${community}`;
    const [query, setQuery] = useState('');
    const { data, isLoading, error, mutate, isValidating } = useSWR(!roles && URL, fetchSds<Role[]>);
    const [filteredData, setFilteredData] = useState<Role[]>([]);
    const [rows, setRows] = useState<Role[]>(roles ?? []);
    const [loadingMore, setLoadingMore] = useState(false);



    useEffect(() => {
        const timeout = setTimeout(() => {
            if (rows) {
                setFilteredData(rows.filter(role =>
                    (role.account.includes(query.toLowerCase())) ||
                    (role.title.includes(query.toLowerCase())) ||
                    (role.role.includes(query.toLowerCase()))));
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [query, rows]);

    useEffect(() => {
        if (data) {
            setRows(data.slice(0, 20));
        }

    }, [data]);

    function handleRefresh() {
        mutate();
    }


    function loadMoreRows(mainData: Role[], rowsData: Role[]) {
        let newStart = mainData?.slice(rowsData?.length ?? 0);
        const newRow = newStart?.slice(1, 20);
        return newRow ?? []
    };



    async function handleEndReached() {
        if (data) {
            setLoadingMore(true);
            await awaitTimeout(2.5);
            const newRows = loadMoreRows(data, rows);
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
                onPress={handleEndReached} ></Button>
        </div>)
    }

    return (
        <div className="flex flex-col gap-2 max-h-[500px] pb-10 overflow-auto" >
            <div className={twMerge('gap-2', stickyHeader && 'sticky top-0 z-10 backdrop-blur-sm')}>
                <div
                    className="flex items-center gap-2
             text-default-900 text-lg font-bold mb-4 z-10">
                    <p>{'Roles'}</p>
                    <Button radius='full'
                        color='default'
                        size='sm'
                        onPress={handleRefresh}
                        isIconOnly>
                        <IoIosRefresh
                            className='text-lg' />
                    </Button>
                </div>

                <div className='flex flex-row gap-2'>

                    <Input size='sm' value={query}
                        className='text-default-900 '
                        onValueChange={setQuery}

                        startContent={<FaSearch className='text-lg text-default-900/80' />}
                        classNames={{
                            inputWrapper: 'h-8 bg-white/20'
                        }}

                        placeholder={'Search...'}
                        maxLength={25} />

                </div>
            </div>

            {(isLoading || isValidating) ? <LoadingCard /> :
                error ? <ErrorCard message={error.message} /> :
                    <div className='flex flex-col gap-2 '
                        id="scrollableDiv">
                        <InfiniteScroll
                            className='gap-2  px-1 pb-1'
                            dataLength={filteredData?.length}
                            next={handleEndReached}
                            hasMore={true}
                            loader={<ListLoader />}
                            scrollableTarget='scrollableDiv'
                            endMessage={
                                <p style={{ textAlign: "center" }}>
                                    <b>No more data</b>
                                </p>
                            }>
                            <div className={clsx('grid grid-cols-1 gap-4', large && 'md:grid-cols-2 lg:grid-cols-3')}>
                                {filteredData?.map((role) => {

                                    return <Card className='border compact border-gray-100/10 shadow-md shadow-gray-400 dark:shadow-default-500 bg-transparent backdrop-blur-md'>
                                        <RoleCard compact role={role} />
                                    </Card>
                                })}
                            </div>
                        </InfiniteScroll >


                    </div>}
        </div>


    )
}