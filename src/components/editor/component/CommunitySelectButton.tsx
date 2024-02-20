'use client';

import { Select, SelectItem } from '@nextui-org/react';
import { useEffect } from 'react';
import { Image } from '@nextui-org/react';
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getResizedAvatar } from '@/libs/utils/image';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';

interface Props {
    community?: Community;
    onSelectCommunity: (community: Community) => void;
    onlyCommunity?: boolean;


}
export default function CommunitySelectButton(props: Props) {
    const { community, onSelectCommunity, onlyCommunity } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const { data: session } = useSession();
    const URL = `/communities_api/getCommunitiesBySubscriber/${session?.user?.name}`;
    const { data, isLoading } = useSWR(onlyCommunity ? undefined :
        session?.user?.name ? URL : undefined, fetchSds<Community[]>)
    const dispatch = useAppDispatch();


    useEffect(() => {
        if (data) {
            dispatch(saveLoginHandler({ ...loginInfo, communities: data }));
        }

    }, [data])

    if (onlyCommunity) {

        return community && <Select
            label={'Select community'}
            className="max-w-xs"
            labelPlacement='outside'
            isDisabled={onlyCommunity}
            startContent={community ? <Image
                loading='lazy'
                className='avatar rounded-full object-contain'
                style={{ width: 24, height: 24 }}
                src={getResizedAvatar(community?.account)} alt={''} /> : null}
            size={'sm'}
            selectedKeys={[community.account]}

            classNames={{
                label: 'text-default-500 text-sm',
                selectorIcon: 'text-default-500',
            }}
        >
            <SelectItem key={community?.account}
                value={community.title || community.account}>
                {community.title || community.account}
            </SelectItem>

        </Select>


    }
    return (
        <div>
            {<Select
                isDisabled={onlyCommunity}
                // clearButtonProps={{
                //     onPress: () => {
                //         setCommunity(undefined)
                //     }
                // }}
                startContent={community ? <Image
                    loading='lazy'
                    className='avatar rounded-full object-contain'
                    style={{ width: 24, height: 24 }}
                    src={getResizedAvatar(community?.account)} alt={''} /> : null}
                size={'sm'}
                selectedKeys={community ? [community.account] : undefined}
                selectionMode='single'
                onChange={e => {
                    if (loginInfo.communities)
                        onSelectCommunity(loginInfo.communities.filter(community => community.account === e.target.value)[0]);
                }}
                // defaultSelectedKeys={[(community?.account || '')]}
                isLoading={isLoading}
                label={'Select community'}
                className="max-w-xs"
                labelPlacement='outside'
                classNames={{ label: 'text-default-500 text-sm', selectorIcon: 'text-default-500' }}
            >
                {(loginInfo.communities ?? []).map((item) => (
                    <SelectItem key={item.account}
                        textValue={item.title}
                        value={JSON.stringify(item)}>
                        <div className="flex gap-2 items-center flex-row">
                            <Image className='avatar rounded-full'
                                src={getResizedAvatar(item.account)} width={30} height={30} alt={''} />
                            <div className="text-small ">{item.title}</div>
                        </div>
                    </SelectItem>
                ))}

            </Select>

            }
        </div>
    )
}
