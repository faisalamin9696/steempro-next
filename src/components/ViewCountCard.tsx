import React from 'react'
import { FaEye } from 'react-icons/fa';
import useSWR from 'swr';
import STooltip from './STooltip';
import { abbreviateNumber } from '@/libs/utils/helper';
import { getPostsViews } from '@/libs/firebase/firebaseApp';
import clsx from 'clsx';

type Props = {
    author?: string;
    permlink?: string;
    authPerm?: string;
    comment?: Post | Feed;
    className?: string;
} & (
        { author: string; permlink: string } |
        { authPerm: string } |
        { comment: Post | Feed }
    );


export default function ViewCountCard(props: Props) {
    let authPerm;
    if (!props.authPerm)
        authPerm = `${props.author || props.comment?.author}/${props.permlink || props.comment?.permlink}`;
    else authPerm = props.authPerm;

    const { data, isLoading, isValidating, error } = useSWR(authPerm, getPostsViews);


    if (error) return null

    if (!data || data <= 0) return null

    return (<div className={clsx(data && props.className)}>
        <STooltip content={`${data} unique views`}>
            <div className='flex flex-row gap-2 items-center'>
                <FaEye className='text-lg opacity-90' />
                <p className='text-md font-semibold'>{abbreviateNumber(data)}</p>
            </div>
        </STooltip>
    </div>
    )
}