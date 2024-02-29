import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { followUser } from '@/libs/steem/condenser';
import { Button } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { toast } from 'sonner';

type Props = {
    account: AccountExt;
    comment?: never;
} | {
    account?: never;
    comment: Post | Feed;
};

export default function FollowButton(props: Props) {
    const { account, comment } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const followingAccount = comment ? comment.author : account?.name;
    const isFollowing = comment ? !!comment.observer_follows_author : account?.observer_follows_author;
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    function handleSuccess(follow?: boolean) {
        if (comment)
            dispatch(addCommentHandler({ ...comment, observer_follows_author: follow ? 1 : 0 }));

        if (account)
            dispatch(addProfileHandler({ ...account, observer_follows_author: follow ? 1 : 0 }));
        if (follow)
            toast.success('Followed')
        else toast.success('Unfollowed');

    }
    function handleFailed(error: any) {
        toast.error('Failed: ' + String(error));

    }
    const followMutation = useMutation({
        mutationFn: (key: string) => followUser(loginInfo, key, {
            follower: loginInfo.name,
            following: followingAccount

        }),
        onSuccess() {
            handleSuccess();
        }, onError(error) { handleFailed(error) }, onSettled() {
            setLoading(false);
        }
    });
    return (
        <div>
            <Button
                disabled={loading}
                color={isFollowing ? 'warning' : "secondary"}
                radius="full"
                size='sm'
                className='min-w-0  h-6'
                title={isFollowing ? 'Unfollow' : 'Follow'}
                variant={isFollowing ? "bordered" : "solid"}
                onPress={() => { }}

            >
                {isFollowing ? 'Unfollow' : 'Follow'}

            </Button>
        </div>
    )
}
