import React from "react";
import { Avatar, AvatarGroup, Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import { fetchSds } from "@/libs/constants/AppFunctions";
import SAvatar from "./SAvatar";
import { abbreviateNumber } from "@/libs/utils/helper";
import clsx from "clsx";
import { SlUserFollowing } from "react-icons/sl";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { getResizedAvatar } from "@/libs/utils/image";
import STooltip from "./STooltip";
import LoadingCard from "./LoadingCard";


interface Props {
    username: string;
    compact?: boolean;
}


export const UserCard = (props: Props) => {
    const { username, compact } = props;
    // const [isFollowed, setIsFollowed] = React.useState(comment.observer_follows_author === 1);
    const { data: session } = useSession();
    const URL = `/accounts_api/getAccountExt/${username}/${session?.user?.name || 'null'}`;
    const { data, isLoading } = useSWR(URL, fetchSds<AccountExt>);
    const URL_2 = `/followers_api/getKnownFollowers/${username}/${session?.user?.name || 'null'}`
    const { data: knownPeople, isLoading: isKnownLoading } = useSWR(compact ? null : URL_2, fetchSds<string[]>)
    const posting_json_metadata = JSON.parse(String(data?.posting_json_metadata || '{}'));

    if (isLoading) {
        return <LoadingCard />
    }
    return (
        <div
            className="relative flex flex-col card-content border-none 
            bg-transparent items-start gap-4 p-2 w-full">
            <div className="flex flex-row justify-between gap-2 w-full">
                <div className="flex gap-2">
                    <SAvatar {...props} username={username} />
                    <div className="flex flex-col items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{posting_json_metadata?.profile?.name}</h4>
                        {/* <Link prefetch={false} href={authorLink}>{comment.author}</Link> */}

                        <h5 className={clsx("text-small tracking-tight text-default-500")}>@{username}</h5>
                    </div>
                </div>
                <Button
                    disabled={isLoading}
                    color={"secondary"}
                    radius="full"
                    size='sm'
                    className="text-tiny  p-0 py-0"
                    variant={data?.observer_follows_author ? "bordered" : "solid"}
                    onPress={() => { }}
                >
                    {data?.observer_follows_author ? "Unfollow" : "Follow"}
                </Button>

            </div>

            <div className="flex flex-row gap-2" >
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">{abbreviateNumber(data?.count_following)}</p>
                    <p className=" text-default-500 text-small">{'Followings'}</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">{abbreviateNumber(data?.count_followers)}</p>
                    <p className="text-default-500 text-small">{'Followers'}</p>
                </div>



            </div>

            {!compact && <div>

                <div className="">
                    <div className="flex gap-2 items-center text-gray-800 dark:text-gray-300 mb-4">

                        <SlUserFollowing className={clsx('h-4 w-4', compact && 'h-2 w-2', " text-gray-600 dark:text-gray-400")} />
                        <span className={clsx(compact && 'text-tiny')}>
                            <strong
                                className={clsx(
                                    "text-black dark:text-white")}>{knownPeople?.length}</strong> Followers you know</span>
                    </div>
                    <div className="flex px-2">
                        <AvatarGroup isBordered size="sm">
                            {knownPeople?.map((people) => {
                                return (<STooltip content={people}>
                                    <Avatar src={getResizedAvatar(people)} />
                                </STooltip>)


                            })}

                        </AvatarGroup>
                    </div>
                </div>
            </div>}



        </div >
    );
};

export default UserCard