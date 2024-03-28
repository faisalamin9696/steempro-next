import { Popover, PopoverTrigger, PopoverContent, } from '@nextui-org/popover';
import { Button } from '@nextui-org/button';
import { RadioGroup, Radio } from '@nextui-org/radio';

import React, { memo, useState } from 'react'
import { FaDollarSign } from 'react-icons/fa'


export const rewardTypes: Payout[] = [{ title: 'Decline Payout', shortTitle: 'Declined', payout: 0 },
{ title: '50% SBD / 50% SP', shortTitle: '50/50', payout: 50 },
{ title: 'Power Up 100%', shortTitle: '100%', payout: 100 }];


interface Props {
    onSelectReward?: (reward: Payout) => void;
    selectedValue: Payout;
    isDisabled?: boolean;

}

export default memo(function RewardSelectButton(props: Props) {
    const { onSelectReward, selectedValue, isDisabled } = props;

    const [rewardPopup, setRewardPopup] = useState(false);


    return (<div title='Payout reward type'>
        <Popover isOpen={rewardPopup} onOpenChange={(open) => setRewardPopup(open)}
            placement={'top-start'} className='' classNames={{
                content: 'bg-teal-600'
            }}>
            <PopoverTrigger >
                <Button size='sm'
                    isDisabled={isDisabled}
                    startContent={<FaDollarSign className='text-lg' />}
                    className='text-white  bg-teal-600'

                    radius='lg' variant='shadow'>
                    {'Reward'}: {selectedValue.shortTitle}
                </Button>

            </PopoverTrigger>
            <PopoverContent >
                <div className="px-1 py-2">
                    <div className='space-y-1 text-white'>
                        <p className="flex text-small font-bold">{'Reward type'}</p>
                        <p className='text-white/80 text-tiny'>{'What type of tokens do you want as rewards?'}</p>
                    </div>
                    <RadioGroup color='danger'
                        className='mt-2'
                        size='sm'

                        defaultValue={JSON.stringify(selectedValue ?? rewardTypes[1])}
                        onValueChange={(key) => {
                            setRewardPopup(false);
                            onSelectReward && onSelectReward(JSON.parse(key));
                        }}

                    >
                        {rewardTypes?.map(reward => {
                            return <Radio classNames={{ label: 'text-white' }} key={reward.shortTitle}
                                value={JSON.stringify(reward)}>{reward.title}</Radio>

                        })}
                    </RadioGroup>
                </div>
            </PopoverContent>

        </Popover>
    </div>
    )
})
