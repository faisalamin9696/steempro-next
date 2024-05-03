'use client';

import MainWrapper from '@/components/wrappers/MainWrapper'
import { getKeyType } from '@/libs/steem/condenser';
import { getAuthorExt } from '@/libs/steem/sds';
import { getResizedAvatar } from '@/libs/utils/image';
import { PrivKey } from '@/libs/utils/user';
import { Avatar, Button, Input, Textarea } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

export default function MassVotingPage() {

    const [advance, setAdvance] = useState(false);

    let [username, setUsername] = useState('');
    const [links, setLinks] = useState('');
    const [avatar, setAvatar] = useState('');
    const [key, setKey] = useState('');

    useEffect(() => {
        const timeOut = setTimeout(() => {
            username = username.trim().toLowerCase();
            setAvatar(username)
        }, 1000);

        return () => clearTimeout(timeOut)
    }, [username]);


    async function handleVoting() {
        if (advance) {
            if (!key) {
                toast.info('Invalid private posting key');
                return
            }
        }

        const account = await getAuthorExt(username);
        if (account) {
            const keyType = getKeyType(account, key);
            if (!keyType || !PrivKey.atLeast(keyType.type, 'POSTING')) {
                toast.info('Invalid private posting key');
                return
            }

            

        }


    }



    return (
        <MainWrapper>

            <div className='flex flex-col items-center gap-8'>

                <p className=' text-xl font-bold'>Mass Voting</p>

                <div className='flex flex-col gap-4 w-full'>

                    <div className=' flex flex-row gap-2 items-center'>
                        <Input size="sm" isDisabled={!advance} label='Username'
                            placeholder="Enter voter username" isRequired className='flex-1'
                            endContent={<Avatar
                                src={getResizedAvatar('faisalamin')}
                                size="sm" />}
                        />

                        <Button size='sm' onClick={() => { setAdvance(!advance) }}
                            variant={'flat'} color={advance ? 'primary' : 'secondary'}
                        >Use different account</Button>

                    </div>

                    {advance && <Input
                        size="sm"
                        value={key}
                        onValueChange={setKey}
                        isRequired={advance}
                        label="Private key"
                        placeholder="Enter your private posting key"
                        type="password"
                    />}

                    <Input
                        size="sm"
                        value={key}
                        onValueChange={setKey}
                        isRequired
                        label="Vote weight"
                        placeholder="Enter Vote weight 0.1-100 %"
                        inputMode='decimal'
                        type='number'
                        step={0.1}
                        max={100}
                        min={0.1}
                        defaultValue='100'
                    />

                    <Textarea label={'Links'}
                        isMultiline
                        placeholder='Paste the links here...'
                        disableAutosize
                        rows={6} />

                    <Button className='self-start'>Start voting</Button>

                </div>

            </div>


        </MainWrapper>
    )
}
