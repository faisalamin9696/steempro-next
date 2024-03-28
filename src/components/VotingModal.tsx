import { Button } from '@nextui-org/button';
import { Card, CardHeader } from '@nextui-org/card';
import React, { useEffect, useState } from 'react'
import { IoChevronDownCircleSharp, IoChevronUpCircleSharp } from 'react-icons/io5';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getVoteData } from '@/libs/steem/sds';
import { twMerge } from 'tailwind-merge';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './style.scss';

interface Props {
    comment: Feed | Post,
    downvote?: boolean;
    onConfirm?: (weight: number, downvote?: boolean) => void;
}


const ItemCard = ({ tooltip, title, value }: { tooltip: string, title: string, value: string }) => {
    return <div className="flex gap-1">
        <p className="font-semibold text-default-500 text-tiny">{value ?? '-'}</p>
        <p title={tooltip} className="text-default-400 text-tiny">{title}</p>
    </div>
}

export default function VotingModal(props: Props) {
    const { downvote, onConfirm } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const [voteData, setVoteData] = useState<VoteData>();
    let [value, setValue] = React.useState(100);

    useEffect(() => {
        setVoteData(getVoteData(loginInfo, globalData, downvote));
    }, []);

    const handleValueChange = (value: any) => {
        if (isNaN(Number(value))) return;
        setValue(Number(value));
    };

    async function castVote() {
        onConfirm && onConfirm(value, downvote);

    }

    const marks = {
        0: 0,
        25: '25%',
        50: '50%',
        75: '75%',
        100: '100%'
    };


    return (<Card shadow="none" className={twMerge("min-w-[300px] w-full  border-2 p-0 overflow-visible pb-1",
        downvote ? 'border-red-600' : ' border-success-400')}>
        <CardHeader className="flex flex-col  w-full gap-2 pb-0">

            <div className=' flex items-center w-full pr-3'>
                <div className='flex gap-1 items-center'>
                    {downvote ?
                        <Button onClick={castVote} color='danger' isIconOnly
                            size='sm'
                            className=' min-w-0 h-6 w-6'
                            radius='full' variant='flat'>
                            <IoChevronDownCircleSharp className='text-xl' />
                        </Button>
                        :
                        <Button onClick={castVote} color='success' isIconOnly
                            className=' min-w-0 h-6 w-6'

                            variant='flat' radius='full' size='sm'>
                            <IoChevronUpCircleSharp className='text-xl' />
                        </Button>}

                    <p className='text-tiny'>{value}%</p>
                </div>

                <Slider
                    className='ms-3'
                    onChange={handleValueChange}
                    // color={downvote ? 'danger' : "success"}
                    step={1}
                    defaultValue={100}
                    max={100}
                    min={1}
                    value={value}
                    classNames={{
                        rail: twMerge(downvote ? '!bg-danger' : "!bg-success"),
                        handle: twMerge(' !rounded-lg h-6 w-6', downvote ? '!border-danger' : "!border-success"),

                    }}
                    dotStyle={{
                        opacity: 80,
                        border: 0,
                    }}
                    styles={{

                        handle: {
                            height: 20,
                            width: 20,
                            backgroundColor: 'black',
                            opacity: 1,
                            marginTop: -9,
                        }
                    }}

                    included={false}
                    marks={marks}
                />
            </div>

            <div className=' className="gap-2 flex flex-row px-1 justify-between w-full mt-4'>
                <ItemCard title={'VP'} tooltip={`${'Voting power'}: ${downvote ?
                    loginInfo?.downvote_mana_percent?.toFixed(1) : loginInfo?.upvote_mana_percent?.toFixed(1)}%`}
                    value={`${downvote ? loginInfo?.downvote_mana_percent?.toFixed(1) :
                        loginInfo?.upvote_mana_percent?.toFixed(1)}%`} />

                <ItemCard title={'RC'}
                    tooltip={`${'Resource credit'}: ${loginInfo?.rc_mana_percent?.toFixed(1)}%`}
                    value={`${loginInfo?.rc_mana_percent?.toFixed(1)}%`} />
                {/* 
                <ItemCard title={'Current'} tooltip={`${'Current vote value'}: ${voteData?.current_vote?.toFixed(3)}$`}
                    value={`${voteData?.current_vote?.toFixed(3)}$`} /> */}

                <ItemCard title={'Full'} tooltip={`${'Full vote value'}: ${voteData?.full_vote?.toFixed(3)}$`}
                    value={`${voteData?.full_vote?.toFixed(3)}$`} />
            </div>


        </CardHeader>


    </Card >

    )
}
