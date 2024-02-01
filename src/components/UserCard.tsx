import React from "react";
import { Avatar, AvatarGroup, Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import { useAppDispatch } from "@/libs/constants/AppFunctions";
import { getAuthorExt } from "@/libs/steem/sds";
import SAvatar from "./SAvatar";
import { abbreviateNumber } from "@/libs/utils/helper";
import clsx from "clsx";
import { SlUserFollowing } from "react-icons/sl";

interface Props {
    comment: Feed | Post;
    compact?: boolean;
}


export const UserCard = (props: Props) => {
    const { comment, compact } = props;
    const [isFollowed, setIsFollowed] = React.useState(comment.observer_follows_author === 1);
    const dispatch = useAppDispatch();
    const queryKey = [`profile-${comment.author}`];

    const { data, isLoading, isSuccess } = useQuery({
        queryKey,
        queryFn: () => getAuthorExt(comment.author),
    });

    if (isSuccess) {
        dispatch(addProfileHandler(data));
    }


    return (
        <Card shadow="none" className="max-w-[300px] border-none bg-transparent">
            <CardHeader className="justify-between space-x-2">
                <div className="flex gap-3">
                    <SAvatar {...props} username={comment.author} />
                    <div className="flex flex-col items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{data?.posting_json_metadata?.profile?.name}</h4>
                        {/* <Link prefetch={false} href={authorLink}>{comment.author}</Link> */}

                        <h5 className="text-small tracking-tight text-default-500">@{comment.author}</h5>
                    </div>
                </div>
                <Button
                    className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
                    color="secondary"
                    radius="full"
                    size="sm"
                    variant={isFollowed ? "bordered" : "solid"}
                    onPress={() => setIsFollowed(!isFollowed)}
                >
                    {isFollowed ? "Unfollow" : "Follow"}
                </Button>

            </CardHeader>
            {/* <CardBody className="px-3 py-0">
                <p className=" line-clamp-2 text-tiny pl-px text-default-500">
                    {data?.posting_json_metadata?.profile.about}
                  
                </p>
            </CardBody> */}
            <CardFooter className="gap-3 py-0">
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">{abbreviateNumber(data?.count_following)}</p>
                    <p className=" text-default-500 text-small">{'Followings'}</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-small">{abbreviateNumber(data?.count_followers)}</p>
                    <p className="text-default-500 text-small">{'Followers'}</p>
                </div>



            </CardFooter>

            <CardFooter>

                <div className="">
                    <div className="flex gap-2 items-center text-gray-800 dark:text-gray-300 mb-4">

                        <SlUserFollowing className={clsx('h-4 w-4', compact && 'h-2 w-2', " text-gray-600 dark:text-gray-400")} />
                        <span className={clsx(compact && 'text-tiny')}>
                            <strong
                                className={clsx(
                                    "text-black dark:text-white")}>12</strong> Followers you know</span>
                    </div>
                    <div className="flex px-2">
                        <AvatarGroup isBordered size="sm">
                            <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                            <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                            <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
                        </AvatarGroup>
                    </div>
                </div>
            </CardFooter>



        </Card>
    );
};

export default UserCard