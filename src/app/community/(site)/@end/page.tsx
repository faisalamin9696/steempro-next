"use client"

import ErrorCard from '@/components/ErrorCard';
import LoadingCard from '@/components/LoadingCard';
import RoleCard from '@/components/RoleCard';
import { fetchSds } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient'
import { Button, Card, Input } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa';
import { IoIosRefresh } from 'react-icons/io'
import useSWR from 'swr';

export default function CommunityEnd() {

    const { community } = usePathnameClient();

    const URL = `/communities_api/getCommunityRoles/${community}`;
    const [query, setQuery] = useState('');
    const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetchSds<Role[]>);
    const [filteredData, setFilteredData] = useState<Role[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (data) {
                setFilteredData(data.filter(role =>
                    (role.account.includes(query.toLowerCase())) ||
                    (role.title.includes(query.toLowerCase())) ||
                    (role.role.includes(query.toLowerCase()))));
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [query, data])

    function handleRefresh() {
        mutate();
    }

    return (
        <div className="flex flex-col pb-60">
            <div className='sticky top-0 z-10 backdrop-blur-lg'>
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
                    <div className='flex flex-col gap-2 px-1 pb-1'>
                        {filteredData?.map(role => {
                            return <Card className='border compact border-gray-100/10 shadow-md shadow-gray-400 dark:shadow-default-500 bg-transparent backdrop-blur-md'>
                                <RoleCard compact role={role} />
                            </Card>
                        })}
                    </div>}
        </div>


    )
}