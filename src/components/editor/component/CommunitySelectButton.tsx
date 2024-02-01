
import { Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from '@nextui-org/react';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { Minute } from '@/libs/constants/AppConstants';
import { getAuthorCommunities } from '@/libs/steem/sds';
import { getResizedAvatar } from '@/libs/utils/image';

interface Props {
    community?: Community;
    onSelectCommunity: (community: Community) => void;

}
function myBlog(username: string): Community {

    return {
        account: username,
        title: 'My Blogs', about: '',
        id: 0,
        type: 0,
        account_reputation: 0,
        created: 0,
        rank: 0,
        sum_pending: 0,
        count_pending: 0,
        count_authors: 0,
        count_subs: 0,
        lang: '',
        description: '',
        flag_text: '',
        is_nsfw: 0,
        settings: undefined,
        observer_subscribed: 0,
        observer_role: '',
        observer_title: ''
    }

}

export default function CommunitySelectButton(props: Props) {
    const { community, onSelectCommunity } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const queryKey = [`communities-${loginInfo.name}`];
    const [communities, setCommunities] = useState<Community[]>([]);


    const { data, isLoading, isSuccess } = useQuery({
        gcTime: 10 * Minute, // 10 minutes
        enabled: !!loginInfo.name,
        queryKey,
        queryFn: () => getAuthorCommunities(loginInfo.name, loginInfo.name)

    });

    useEffect(() => {
        if (isSuccess) {
            setCommunities([myBlog(loginInfo.name)].concat(data));
        }


    }, [isSuccess]);

    return (
        <div>
            <Select
                // clearButtonProps={{
                //     onPress: () => {
                //         setCommunity(undefined)
                //     }
                // }}
                startContent={community ? <Image
                    loading='lazy'
                    className='avatar rounded-full'
                    style={{ width: 26, height: 26 }}
                    src={getResizedAvatar(community?.account)} alt={''} /> : null}
                size={'sm'}
                // width={40}
                // selectedKeys={community ? [community.account] : undefined}
                selectionMode='single'
                onChange={e => {
                    onSelectCommunity(communities.filter(community => community.account === e.target.value)[0]);
                }}
                isLoading={isLoading}
                label={'Select community'}
                className="max-w-xs"
                labelPlacement='outside'
                classNames={{ label: 'text-default-500 text-sm', selectorIcon: 'text-default-500' }}


            >
                {communities.map((community) => (
                    <SelectItem key={community.account}
                        textValue={community.title}
                        value={JSON.stringify(community)}>
                        <div className="flex gap-2 items-center flex-row">
                            <Image className='avatar rounded-full'
                                src={getResizedAvatar(community.account)} width={30} height={30} alt={''} />
                            <div className="text-small ">{community.title}</div>
                        </div>
                    </SelectItem>
                ))}

            </Select>
        </div>
    )
}
