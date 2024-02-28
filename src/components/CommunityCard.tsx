import React from "react";
import { Button, Card, User } from "@nextui-org/react";
import { abbreviateNumber } from "@/libs/utils/helper";
import Reputation from "./Reputation";
import { FaClock, FaEllipsis } from "react-icons/fa6";
import TimeAgoWrapper from "./wrapper/TimeAgoWrapper";
import { getResizedAvatar } from "@/libs/utils/image";
import { useRouter } from "next/navigation";


interface Props {
    community: Community;
    compact?: boolean;
}


export const CommunityCard = (props: Props) => {
    const { community, compact } = props;
    // // const [isFollowed, setIsFollowed] = React.useState(comment.observer_follows_author === 1);
    // const { data: session } = useSession();
    // const URL = `/accounts_api/getAccountExt/${username}/${session?.user?.name || 'null'}`;
    // const { data, isLoading } = useSWR(URL, fetchSds<AccountExt>);
    // const URL_2 = `/followers_api/getKnownFollowers/${username}/${session?.user?.name || 'null'}`
    // const { data: knownPeople, isLoading: isKnownLoading } = useSWR(compact ? null : URL_2, fetchSds<string[]>)

    // const posting_json_metadata = JSON.parse(String(data?.posting_json_metadata || '{}'));

    const router = useRouter();
    function handleExplore() {
        router.push(`/trending/${community.account}`)

    }

    return (
        <Card isBlurred isPressable={compact} onPress={handleExplore}
            className="relative flex flex-col items-start gap-2 p-4 w-full">

            {!compact &&
                <Button onPress={handleExplore}
                    size="sm" color="primary" radius="full"
                    className="top-5 right-5 absolute">Explore</Button>}

            <User

                classNames={{
                    description: 'mt-1 text-default-900/60 dark:text-gray-200 text-sm',
                    name: 'text-default-800'
                }}
                name={<div className='flex flex-col items-start gap-2'>

                    <h2>{community.title}</h2>

                    <div className="flex gap-2 items-center">
                        {<p>{community.account}</p>}
                        {/* <Reputation {...props} reputation={community.account_reputation} /> */}

                    </div>

                </div>}
                description={<div className='flex flex-col'>

                    {!compact && community.observer_role && community.observer_title ?
                        <div className='flex space-x-2 items-center'>
                            <p className='flex-none'>
                                {community.observer_role}
                            </p>
                            <p className='flex-none dark:bg-default-900/30 max-sm:text-xs px-1  rounded-lg inline-block'>{community.observer_title}</p>
                        </div> : null}

                    {/* <div className='time-div flex space-x-1'>
                        <TimeAgoWrapper lang={'en'} created={community.created * 1000} />
                       
                    </div> */}

                </div>}
                avatarProps={{
                    className: '',
                    src: getResizedAvatar(community.account),
                    // as: 'a',
                    // onClick: () => {
                    //     navigation.push(authorLink);
                    // },


                }}
            />
            <div className="flex flex-row gap-4">
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">{abbreviateNumber(community.count_subs)}</p>
                    <p className=" text-default-500 text-small">{compact ? 'Subs' : 'Subscribers'}</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">${abbreviateNumber(community.count_pending)}</p>
                    <p className="text-default-500 text-small">{'Pending Reward'}</p>
                </div>
            </div>

            <span className="py-1 text-xs font-regular text-default-900 mr-1 flex flex-row items-center">

                <FaClock className=' text-sm' />
                <span className="ml-1">
                    <span className="ml-1 flex gap-2">Created <TimeAgoWrapper lang={'en'} created={community.created * 1000} /></span>
                </span>
            </span>

        </Card >
    );
};

export default CommunityCard