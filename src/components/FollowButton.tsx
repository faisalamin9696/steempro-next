import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { followUser, unfollowUser } from '@/libs/steem/condenser';
import { Button, Spinner } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useLogin } from './useLogin';
import { getCredentials, getSessionKey } from '@/libs/utils/user';
import clsx from 'clsx';

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
    const isFollowing = comment ? comment.observer_follows_author === 1 : account?.observer_follows_author === 1;
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();

    function handleSuccess(follow?: boolean) {
        if (comment)
            dispatch(addCommentHandler({ ...comment, observer_follows_author: isFollowing ? 0 : 1 }));

        if (account)
            dispatch(addProfileHandler({ ...account, observer_follows_author: isFollowing ? 0 : 1 }));
        if (follow)
            toast.success('Followed')
        else toast.success('Unfollowed');

    }
    function handleFailed(error: any) {
        toast.error('Failed: ' + String(error));

    }
    const followMutation = useMutation({
        mutationFn: (key: string) => isFollowing ? unfollowUser(loginInfo, key, {
            follower: loginInfo.name,
            following: followingAccount
        }) : followUser(loginInfo, key, {
            follower: loginInfo.name,
            following: followingAccount

        }),
        onSuccess() {
            handleSuccess();
        }, onError(error) { handleFailed(error) }, onSettled() {
            setLoading(false);
        }
    });


    function handleFollow() {
        authenticateUser();
        if (!isAuthorized())
            return

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Something went wrong!');
            return
        }
        setLoading(true);

        if (isFollowing)
            followMutation.mutate(credentials.key);

    }
    return (
        <div>
            <Button
                disabled={loading}
                color={isFollowing ? 'warning' : "secondary"}
                radius="full"
                size='sm'
                className={clsx('min-w-0  h-6', loading && 'animate-pulse')}
                title={isFollowing ? 'Unfollow' : 'Follow'}
                variant={isFollowing ? "bordered" : "solid"}
                onPress={handleFollow}

            >
                {isFollowing ? 'Unfollow' : 'Follow'}

            </Button>
        </div>
    )
}
