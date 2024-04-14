import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { followUser, subscribeCommunity, unfollowUser } from '@/libs/steem/condenser';
import { Button } from '@nextui-org/button'
import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { useLogin } from './AuthProvider';
import { getCredentials, getSessionKey } from '@/libs/utils/user';
import clsx from 'clsx';
import { addCommunityHandler } from '@/libs/redux/reducers/CommunityReducer';
import { FaPencil } from 'react-icons/fa6';
import { useRouter } from 'next13-progressbar';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { LuPencilLine } from 'react-icons/lu';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
    const { username } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const communityInfo: Community = useAppSelector(state => state.communityReducer.values)[community?.account ?? ''] ?? community;
    const { data: session } = useSession();

    const followingAccount = comment ? comment.author : account?.name;
    const isFollowing = comment ? comment.observer_follows_author === 1 : account?.observer_follows_author === 1;
    const isSubscribed = communityInfo?.observer_subscribed === 1;
    const dispatch = useAppDispatch();
    const isSelf = !!loginInfo.name && (loginInfo.name === username);

    const { authenticateUser, isAuthorized } = useLogin();
    const router = useRouter();

    function handleSuccess(follow?: boolean) {
        if (comment)
            dispatch(addCommentHandler({
                ...comment,
                observer_follows_author: isFollowing ? 0 : 1, status: 'idle'
            }));

        if (account)
            dispatch(addProfileHandler({
                ...account,
                observer_follows_author: isFollowing ? 0 : 1, status: 'idle'
            }));

        if (isFollowing)
            toast.success('Unfollowed')
        else toast.success('Followed');

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
            community: communityInfo!.account,
            subscribe: isSubscribed ? false : true
        }), onSettled(data, error, variables, context) {
            if (error) {
                handleFailed(error)
                return;
            }
            if (isSubscribed)
                toast.success('Left')
            else toast.success('Joined');
            dispatch(addCommunityHandler({ ...communityInfo, observer_subscribed: isSubscribed ? 0 : 1, status: 'idle' }));
        },
    });


    async function handleFollow() {
        authenticateUser();
        if (!isAuthorized())
            return

        const credentials = getCredentials(getSessionKey(session?.user?.name));
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }
        if (communityInfo) {
            dispatch(addCommunityHandler({ ...communityInfo, status: isSubscribed ? 'leaving' : 'joining' }));
            joinMutation.mutate(credentials.key);
            return
        }
        dispatch(addProfileHandler({ ...account, status: isFollowing ? 'unfollowing' : 'following' }));
        followMutation.mutate(credentials.key);

    }

    function handleAccountEdit() {
        if (account?.name)
            router.push(`/@${account?.name}/settings`);

    }


    const isPending = followMutation.isPending || joinMutation.isPending ||
        communityInfo?.status === 'leaving' || communityInfo?.status === 'joining' ||
        account?.status === 'following' || account?.status === 'unfollowing';

    return (
        <div className='flex flex-row items-start gap-1 justify-center'>

            {isSelf && <Button size='sm' variant='flat'
                title='Edit profile'
                className={clsx('min-w-0  h-6')}
                color='primary'
                onClick={handleAccountEdit}
                startContent={<FaPencil />}
                radius='full'>
                Edit
            </Button>}

            {communityInfo && !!communityInfo.observer_subscribed && <Button size='sm' isIconOnly variant='flat'
                title='Create post'
                className={clsx('min-w-0  h-6')}
                color='primary'
                as={Link}
                isDisabled={communityInfo.observer_role === 'muted'}
                href={{
                    pathname: `/submit`,
                    query: {
                        account: communityInfo?.account,
                        title: communityInfo?.title
                    }
                } as any}
                radius='full'>
                <LuPencilLine />
            </Button>}

            {!isSelf && <Button
                isDisabled={isPending}
                color={communityInfo ? isSubscribed ? 'danger' : 'success' :
                    isFollowing ? 'danger' : "success"}
                radius="full"
                size='sm'
                isLoading={isPending}
                className={clsx('min-w-0  h-6')}
                title={communityInfo ? isSubscribed ? 'Leave community' : 'Join community' :
                    isFollowing ? 'Unfollow' : 'Follow'}
                variant={'flat'}
                onClick={handleFollow}
                isIconOnly={isPending}

            >
                {isPending ? '' : communityInfo ? isSubscribed ? 'Leave' : 'Join' :
                    isFollowing ? 'Unfollow' : 'Follow'}

            </Button>}


        </div>
    )
}
