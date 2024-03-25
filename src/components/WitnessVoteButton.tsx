import { useAppSelector, useAppDispatch } from "@/libs/constants/AppFunctions";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { voteForWitness } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from '@nextui-org/button';

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { toast } from "sonner";
import { useLogin } from "./useLogin";

export default function WitnessVoteButton({ witness }: {
    witness: Witness
}) {
    const [isOpen, setIsOpen] = useState(false);
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const dispatch = useAppDispatch();
    const { authenticateUser, isAuthorized } = useLogin();

    const isVoted = loginInfo?.witness_votes?.includes(witness.name);

    const voteMutation = useMutation({
        mutationFn: (key: string) =>
            voteForWitness(loginInfo, key,
                { witness: witness.name, approved: !isVoted }),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            if (isVoted)
                dispatch(saveLoginHandler({ ...loginInfo, witness_votes: loginInfo.witness_votes.filter(item => item !== witness.name) }));
            else dispatch(saveLoginHandler({ ...loginInfo, witness_votes: [...loginInfo.witness_votes, witness.name] }));
            toast.success(isVoted ? 'Witness Removed' : 'Witness Approved');
        },
    })


    async function handleVote() {
        authenticateUser();
        if (!isAuthorized())
            return

        const credentials = getCredentials(getSessionKey());

        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        voteMutation.mutate(credentials.key);

    }
    return (
        <Popover isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            placement={'left'} >
            <PopoverTrigger >
                <Button isIconOnly variant='flat'
                    isDisabled={voteMutation.isPending}
                    isLoading={voteMutation.isPending}
                    color={isVoted ? 'success' : 'default'}
                    radius='sm'
                    size='sm'>{isVoted ?
                        <BiSolidUpvote className='text-xl' />
                        : <BiUpvote className='text-xl' />
                    }</Button>

            </PopoverTrigger>
            <PopoverContent >
                <div className="px-1 py-2">
                    <div className="text-small font-bold">{'Confirmation'}</div>
                    <div className="text-tiny flex">
                        {isVoted ? `Remove withness ${witness.name}?` :
                            `Approve witness ${witness.name}?`}
                    </div>

                    <div className="text-tiny flex mt-2 space-x-2">
                        <Button onClick={() => setIsOpen(false)}
                            size='sm' color='default'>CANCEL</Button>
                        <Button size='sm' color={isVoted ? 'danger' : 'success'} variant='solid'
                            onClick={() => {
                                setIsOpen(false);
                                handleVote();
                            }}>{isVoted ? 'REMOVE' : 'APPROVE'}</Button>

                    </div>
                </div>
            </PopoverContent>
        </Popover>


    );
}