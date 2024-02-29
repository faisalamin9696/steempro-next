import { useAppSelector } from '@/libs/constants/AppFunctions';
import { followUser } from '@/libs/steem/condenser';
import { Button } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query';
import React from 'react'

type Props = {
    isFollowing?: boolean;
    following?: string;
    comment?: Post | Feed;
} & (
        { isFollowing: boolean; following: string } |
        { comment: Post | Feed }
    );

export default function FollowButton(props: Props) {
    const { isFollowing, following, comment } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const followingAccount = comment ? comment.author : following;
    const isFollowingAccount = comment ? !!comment.observer_follows_author : isFollowing;


    // const followMutation = useMutation({
    //     mutationFn: (key: string) => followUser(loginInfo, key, {
    //         follower: loginInfo.name,
    //         following:

    //     }),
    //     onSuccess() {
    //         handleSuccess();
    //     }, onError(error) { handleFailed(error) }, onSettled() {
    //         setLoading(false);
    //     }
    // });
    return (
        <div>
            <Button
                // disabled={isLoading}
                color={isFollowingAccount ? 'warning' : "secondary"}
                radius="full"
                size='sm'
                className='min-w-0  h-6'
                title={isFollowingAccount ? 'Unfollow' : 'Follow'}
                variant={isFollowingAccount ? "bordered" : "solid"}
                onPress={() => { }}

            >
                {isFollowingAccount ? 'Unfollow' : 'Follow'}

            </Button>
        </div>
    )
}
