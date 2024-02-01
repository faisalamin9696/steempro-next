import { Card, CardFooter, CardHeader, Slider } from '@nextui-org/react'
import clsx from 'clsx';
import React, { useEffect, useState } from 'react'
import IconButton from './IconButton';
import { IoChevronDownCircleSharp, IoChevronUpCircleSharp } from 'react-icons/io5';
import STooltip from './STooltip';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { getVoteData } from '@/libs/steem/sds';

interface Props {
    isOpen: boolean;
    comment: Feed | Post,
    downvote?: boolean;
    onConfirm?: (weight: number, downvote?: boolean) => void;
}


const ItemCard = ({ tooltip, title, value }: { tooltip: string, title: string, value: string }) => {
    return <div className="flex gap-1">
        <p className="font-semibold text-default-600 text-small">{value ?? '...'}</p>
        <STooltip content={tooltip}>
            <p className="text-default-500 text-small">{title}</p>
        </STooltip>
    </div>
}

export default function VotingModal(props: Props) {
    const { isOpen, comment, downvote, onConfirm } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment

    const dispatch = useAppDispatch();
    const queryKey = [`profile-${loginInfo.name}`];
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    // const profileInfo = useAppSelector(state => state.profileReducer.value)['faisalamin'] as AccountExt | undefined;

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


    return (isOpen ? <Card shadow="none" className={clsx(" w-full border bg-transparent",
        downvote ? 'border-red-600' : ' border-green-600')}>
        <CardHeader className="justify-between space-x-2 w-full">
            (<>
                <Slider
                    size="sm"
                    label={<div>
                        {'Weight'}
                    </div>}
                    color={downvote ? 'danger' : "success"}
                    step={1}
                    showTooltip={true}
                    defaultValue={100}
                    maxValue={100}
                    minValue={1}
                    value={value}
                    onChange={handleValueChange}
                    renderValue={({ children, ...props }) => (
                        <output {...props}>

                            <div className='space-x-1 flex items-center'>
                                <STooltip placement='left'
                                    className="text-tiny text-default-500 rounded-md "
                                    content={'Press enter to confirm'} >
                                    <input
                                        className="z-4 px-1 py-0.5 w-12 text-right text-small text-default-700 font-medium bg-default-100 outline-none transition-colors rounded-small border-medium border-transparent hover:border-primary focus:border-primary"
                                        type="text"
                                        value={inputValue}
                                        inputMode='numeric'
                                        maxLength={4}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            handleValueChange(v);

                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !isNaN(Number(inputValue))) {
                                                handleValueChange(Number(inputValue));
                                            }
                                        }}
                                    />
                                </STooltip>
                                <p>%</p>
                            </div>

                        </output>
                    )}
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
                    // classNames={{
                    //     base: "max-w-md gap-3",
                    //     track: clsx(downvote ? 'border-s-danger-100' : "border-s-success-100"),
                    //     filler: clsx("bg-gradient-to-r from-success-100 to-success-500",
                    //         downvote ? 'from-danger-100 to-danger-500' : ''
                    //     )
                    // }}
                    // renderThumb={(props) => (
                    //     <div
                    //         {...props}
                    //         className="group p-1 top-1/2 bg-background border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                    //     >
                    //         <span className={clsx("transition-transform bg-gradient-to-br shadow-small  rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80",
                    //             downvote ? 'from-danger-100 to-danger-500' : 'from-success-100 to-success-500')} />
                    //     </div>
                    // )}

                    endContent={downvote ?
                        <IconButton onClick={castVote} className='ms-2' IconType={IoChevronDownCircleSharp} />
                        :
                        <IconButton onClick={castVote} className='ms-2' IconType={IoChevronUpCircleSharp} />}

                />
            </>)

        </CardHeader>
        {/* <CardBody className="px-3 py-0">

        </CardBody> */}

        <CardFooter className="gap-3">
            <ItemCard title={'VP'} tooltip={`${'Voting power'}:
             ${downvote ? loginInfo?.downvote_mana_percent?.toFixed(1) : loginInfo?.upvote_mana_percent?.toFixed(1)}%`}
                value={`${downvote ? loginInfo?.downvote_mana_percent?.toFixed(1) : loginInfo?.upvote_mana_percent?.toFixed(1)}%`} />

            <ItemCard title={'RC'}
                tooltip={`${'Resource credit'}: ${loginInfo?.rc_mana_percent?.toFixed(1)}%`}
                value={`${loginInfo?.rc_mana_percent?.toFixed(1)}%`} />

            <ItemCard title={'Current'} tooltip={`${'Current vote value'}: ${voteData?.current_vote?.toFixed(3)}$`}
                value={`${voteData?.current_vote?.toFixed(3)}$`} />

            <ItemCard title={'Full'} tooltip={`${'Full vote value'}: ${voteData?.full_vote?.toFixed(3)}$`}
                value={`${voteData?.full_vote?.toFixed(3)}$`} />

        </CardFooter>
    </Card> : null

    )
}
