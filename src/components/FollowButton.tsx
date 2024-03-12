import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { followUser, subscribeCommunity, unfollowUser } from '@/libs/steem/condenser';
import { Button, Spinner } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useLogin } from './useLogin';
import { getCredentials, getSessionKey } from '@/libs/utils/user';
import clsx from 'clsx';
import { addCommunityHandler } from '@/libs/redux/reducers/CommunityReducer';

type Props = {
    account: AccountExt;
    comment?: never;
    community?: Community;
} | {
    account?: never;
    comment: Post | Feed;
    community?: Community;

};

export default function FollowButton(props: Props) {
    const { account, comment, community } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const followingAccount = comment ? comment.author : account?.name;
    const isFollowing = comment ? comment.observer_follows_author === 1 : account?.observer_follows_author === 1;
    const isSubscribed = community?.observer_subscribed === 1;
    const dispatch = useAppDispatch();
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

        }), onSettled(data, error, variables, context) {
            if (error) {
                handleFailed(error)
                return;
            }
            handleSuccess();
        },
    });

    const joinMutation = useMutation({
        mutationFn: (key: string) => subscribeCommunity(loginInfo, key, {
            community: community!.account,
            subscribe: isSubscribed ? false : true
        }), onSettled(data, error, variables, context) {
            if (error) {
                handleFailed(error)
                return;
            }
            if (isSubscribed)
                toast.success('Unsubscribed')
            else toast.success('Joined');
            dispatch(addCommunityHandler({ ...community, observer_subscribed: isSubscribed ? 0 : 1, status: 'idle' }));
        },
    });


    async function handleFollow() {
        authenticateUser();
        if (!isAuthorized())
            return

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }
        if (community) {
            dispatch(addCommunityHandler({ ...community, status: isSubscribed ? 'leaving' : 'joining' }));
            joinMutation.mutate(credentials.key);
            return
        }
        dispatch(addProfileHandler({ ...account, status: isFollowing ? 'unfollowing' : 'following' }));
        followMutation.mutate(credentials.key);

    }

    const isPending = followMutation.isPending || joinMutation.isPending ||
        community?.status === 'leaving' || community?.status === 'joining' ||
        account?.status === 'following' || account?.status === 'unfollowing';

    return (
        <div>
            <Button
                disabled={isPending}
                color={community ? isSubscribed ? 'danger' : 'success' :
                    isFollowing ? 'danger' : "success"}
                radius="full"
                size='sm'
                isLoading={isPending}
                className={clsx('min-w-0  h-6', isPending && 'animate-pulse')}
                title={community ? isSubscribed ? 'Leave community' : 'Join community' :
                    isFollowing ? 'Unfollow' : 'Follow'}
                variant={'flat'}
                onPress={handleFollow}
                isIconOnly={isPending}

            >
                {isPending ? '' : community ? isSubscribed ? 'Leave' : 'Join' :
                    isFollowing ? 'Unfollow' : 'Follow'}

            </Button>

        </div>
    )
}
