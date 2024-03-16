import { Accordion, AccordionItem, Button, Card, CardFooter, CardHeader, Input, Slider } from '@nextui-org/react'
import clsx from 'clsx';
import React, { useEffect, useState } from 'react'
import IconButton from './IconButton';
import { IoChevronDownCircleSharp, IoChevronUpCircleSharp } from 'react-icons/io5';
import STooltip from './STooltip';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getVoteData } from '@/libs/steem/sds';
import { twMerge } from 'tailwind-merge';

interface Props {
    comment: Feed | Post,
    downvote?: boolean;
    onConfirm?: (weight: number, downvote?: boolean) => void;
}


const ItemCard = ({ tooltip, title, value }: { tooltip: string, title: string, value: string }) => {
    return <div className="flex gap-1">
        <p className="font-semibold text-default-600 text-sm">{value ?? '...'}</p>
        <STooltip content={tooltip}>
            <p className="text-default-500 text-sm">{title}</p>
        </STooltip>
    </div>
}

export default function VotingModal(props: Props) {
    const { comment, downvote, onConfirm } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const [voteData, setVoteData] = useState<VoteData>();
    let [value, setValue] = React.useState(100);
    const [inputValue, setInputValue] = React.useState("100");


    // const { data, isLoading, isSuccess } = useQuery({
    //     enabled: !!loginInfo.login,
    //     queryKey,
    //     gcTime: 10 * Minute, // 10 minutes
    //     queryFn: () => getAuthorExt(loginInfo.name),
    // });

    useEffect(() => {

        // dispatch(addProfileHandler(data));
        // dispatch(saveLoginHandler(data));
        setVoteData(getVoteData(loginInfo, globalData, downvote));

    }, [])

    const handleValueChange = (value: any) => {
        if (isNaN(Number(value))) return;
        setValue(Number(value));
        setInputValue(String(value));
    };





    async function castVote() {
        onConfirm && onConfirm(value, downvote);

    }



    // const mutationKey = [`castVoteMutation-${`${comment?.author}/${comment?.permlink}`}`];
    // const castVoteMutation = useMutation({
    //     mutationKey: mutationKey,
    //     mutationFn: async () => {
    //         const newChanges = Object.assign({}, { ...comment, status: downvote ? 'downvoting' : 'upvoting' })
    //         dispatch(addCommentHandler(newChanges));
    //         handleResponse && handleResponse(downvote);

    //         setTimeout(() => {
    //             const newChanges = Object.assign({},
    //                 {
    //                     ...comment, status: undefined, observer_vote: 1,
    //                     observer_vote_percent: downvote ? -value : value, upvote_count: downvote ? comment.upvote_count : comment.upvote_count + 1,
    //                     downvote_count: downvote ? comment.downvote_count + 1 : comment.downvote_count,
    //                 })
    //             dispatch(addCommentHandler(newChanges));
    //             return Promise.resolve();
    //         }, 2500);

    //     }
    // })


    return (<Card shadow="none" className={twMerge("min-w-[300px] w-full  border-2 p-0 overflow-visible",
        downvote ? 'border-red-600' : ' border-success-400')}>
        <CardHeader className="justify-between gap-2 w-full p-0">




            <Accordion isCompact>
                <AccordionItem key="details" aria-label="Voting details"
                    title={
                        <Slider
                            size="sm"

                            // color={downvote ? 'danger' : "success"}
                            step={1}

                            showTooltip={true}
                            defaultValue={100}
                            maxValue={100}
                            radius='lg'
                            color={downvote ? 'danger' : 'success'}
                            minValue={1}
                            hideValue
                            value={value}

                            showOutline={true}
                            className="max-w-md"
                            classNames={{ mark: 'text-tiny' }}
                            onChange={handleValueChange}
                            // renderValue={({ children, ...props }) => (
                            //     <output {...props}>

                            //         <div className='space-x-1 flex items-center'>
                            //             <STooltip placement='left'
                            //                 className="text-tiny text-default-500 rounded-md "
                            //                 content={'Press enter to confirm'} >
                            //                 <input
                            //                     className="z-4 px-1 py-0.5 w-12 text-right text-small text-default-700 font-medium bg-default-100 outline-none transition-colors rounded-small border-medium border-transparent hover:border-primary focus:border-primary"
                            //                     type="text"
                            //                     value={inputValue}
                            //                     inputMode='numeric'
                            //                     maxLength={4}
                            //                     onChange={(e) => {
                            //                         const v = e.target.value;
                            //                         handleValueChange(v);

                            //                     }}
                            //                     onKeyDown={(e) => {
                            //                         if (e.key === "Enter" && !isNaN(Number(inputValue))) {
                            //                             handleValueChange(Number(inputValue));
                            //                         }
                            //                     }}
                            //                 />
                            //             </STooltip>
                            //             <p>%</p>
                            //         </div>

                            //     </output>
                            // )}
                            marks={[
                                {
                                    value: 25,
                                    label: "25%",
                                },
                                {
                                    value: 50,
                                    label: "50%",
                                },
                                {
                                    value: 80,
                                    label: "80%",
                                },
                            ]}

                            startContent={<div className='flex gap-2 items-center'>

                                {downvote ?
                                    <Button onClick={castVote} color='danger' isIconOnly radius='full' variant='flat' size='sm'>
                                        <IoChevronDownCircleSharp className='text-2xl' />
                                    </Button>
                                    :
                                    <Button onClick={castVote} color='success' isIconOnly variant='flat' radius='full' size='sm'>
                                        <IoChevronUpCircleSharp className='text-2xl' />
                                    </Button>}

                                <p className='text-tiny'>{value}%</p>
                            </div>

                            }

                        />
                    } isCompact>
                    <div className=' className="gap-2 flex flex-row px-2 justify-between w-full'>
                        <ItemCard title={'VP'} tooltip={`${'Voting power'}: ${downvote ?
                            loginInfo?.downvote_mana_percent?.toFixed(1) : loginInfo?.upvote_mana_percent?.toFixed(1)}%`}
                            value={`${downvote ? loginInfo?.downvote_mana_percent?.toFixed(1) :
                                loginInfo?.upvote_mana_percent?.toFixed(1)}%`} />

                        <ItemCard title={'RC'}
                            tooltip={`${'Resource credit'}: ${loginInfo?.rc_mana_percent?.toFixed(1)}%`}
                            value={`${loginInfo?.rc_mana_percent?.toFixed(1)}%`} />

                        {/* <ItemCard title={'Current'} tooltip={`${'Current vote value'}: ${voteData?.current_vote?.toFixed(3)}$`}
                value={`${voteData?.current_vote?.toFixed(3)}$`} /> */}

                        <ItemCard title={'Full'} tooltip={`${'Full vote value'}: ${voteData?.full_vote?.toFixed(3)}$`}
                            value={`${voteData?.full_vote?.toFixed(3)}$`} />
                    </div>
                </AccordionItem>
            </Accordion>

        </CardHeader>


    </Card>

    )
}
