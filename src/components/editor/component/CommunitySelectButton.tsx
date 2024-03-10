'use client';

import { Avatar, Button, Select, SelectItem } from '@nextui-org/react';
import { memo, useEffect } from 'react';
import { Image } from '@nextui-org/react';
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getResizedAvatar } from '@/libs/utils/image';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { IoCloseOutline } from "react-icons/io5";
import { empty_community } from '@/libs/constants/Placeholders';

interface Props {
    community?: Community;
    onSelectCommunity: (community?: Community) => void;
    onlyCommunity?: boolean;


}
export default memo(function CommunitySelectButton(props: Props) {
    const { community, onSelectCommunity, onlyCommunity } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const { data: session } = useSession();
    const URL = `/communities_api/getCommunitiesBySubscriber/${session?.user?.name}`;
    const { data, isLoading } = useSWR(onlyCommunity ? undefined :
        session?.user?.name ? URL : undefined, fetchSds<Community[]>)
    const dispatch = useAppDispatch();

    const commmunities = onlyCommunity && community ? [{ ...community }] :
        loginInfo.communities ?? []


    useEffect(() => {
        if (data) {
            dispatch(saveLoginHandler({ ...loginInfo, communities: data }));
        }

    }, [data]);

    const handleSelectionChange = (e) => {
        if (e.target.value) {
            const value = JSON.parse(e.target.value);
            onSelectCommunity(empty_community(value?.account, value?.title));
        }

    };
    return (
        <div className='flex flex-row gap-2 items-center'>
            <div className='w-60'>
                <Select
                    aria-label="Select community"
                    selectedKeys={
                        community ? [JSON.stringify({
                            account: community.account,
                            title: community.title
                        })] : []}
                    size='sm'
                    isDisabled={onlyCommunity}
                    items={commmunities}
                    isLoading={isLoading}
                    placeholder='Select Community'
                    className='text-default-500 text-sm'
                    classNames={{
                        // trigger:'min-h-0 h-10',
                        selectorIcon: 'text-default-500'
                    }}
                    renderValue={(items) => {
                        return items.map((item) => {
                            return <div key={item.key} className="flex gap-2 items-center">
                                <Image
                                    loading='lazy'
                                    className='avatar rounded-full object-contain'
                                    style={{ width: 28, height: 28 }}
                                    src={getResizedAvatar(item.data?.account)} alt={item.data?.account} />
                                <div className="flex flex-col">
                                    <span className="text-small">{item.data?.title}</span>
                                    <span className="text-tiny text-default-400">{item.data?.account}</span>
                                </div>
                            </div>
                        })
                    }}

                    onChange={handleSelectionChange}


                >
                    {(item) => (
                        <SelectItem key={JSON.stringify({ account: item.account, title: item.title })}

                            textValue={JSON.stringify(item)}
                            value={item.title}>
                            <div className="flex gap-2 items-center">
                                <Image
                                    loading='lazy'
                                    className='avatar rounded-full object-contain'
                                    style={{ width: 28, height: 28 }}
                                    src={getResizedAvatar(item.account)} alt={item.account} />
                                <div className="flex flex-col">
                                    <span className="text-small">{item.title}</span>
                                    <span className="text-tiny text-default-400">{item.account}</span>
                                </div>
                            </div>


                        </SelectItem>
                    )}


                </Select>
            </div>
            {!onlyCommunity && community && <Button size='sm' isIconOnly
                className='text-default-500'
                radius='full' variant='light'
                onPress={() => onSelectCommunity(undefined)}>
                <IoCloseOutline className='text-xl' />
            </Button>}

        </div >
    )
}
)