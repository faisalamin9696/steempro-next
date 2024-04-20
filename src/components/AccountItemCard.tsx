import { addToCurrent, removeSessionToken, saveSessionKey } from '@/libs/utils/user';
import { Chip } from '@nextui-org/chip';
import { Button } from '@nextui-org/button';
import { Card, CardBody, } from '@nextui-org/card';
import React, { memo, useState } from 'react'
import SAvatar from './SAvatar';
import { useAppDispatch } from '@/libs/constants/AppFunctions';
import { getAuthorExt } from '@/libs/steem/sds';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

interface Props {
    user: User;
    defaultAccount?: User;
    handleSwitchSuccess?: () => void;
    className?: string;
    switchText?: string;
    isLogin?: boolean;
    isDisabled?: boolean;
}


const keysColorMap = {
    POSTING: "warning",
    ACTIVE: "success",
    OWNER: "danger",
};


export default memo(function AccountItemCard(props: Props) {
    const { defaultAccount, user, handleSwitchSuccess,
        switchText, isLogin, isDisabled } = props;

    const dispatch = useAppDispatch();
    const router = useRouter();
    const [switching, setSwitching] = useState(false);

    function onComplete(error?: string | null) {

        // remogve session token when user changed not for changing between keys
        if (user.username !== defaultAccount?.username) {
            removeSessionToken(user.username);
            removeSessionToken(defaultAccount?.username);
        }

        setSwitching(false);
        if (error)
            toast.error(error);
        else router.refresh();
    }

    async function handleSwitch() {
        // authenticateUser();
        setSwitching(true);
        try {
            const account = await getAuthorExt(user.username);
            if (account) {
                const firebaseAuth = getAuth();

                signInAnonymously(firebaseAuth)
                    .then(async () => {

                        addToCurrent(account.name, user.key, user.type);


                        const response = await signIn('credentials', {
                            username: user.username,
                            redirect: false
                        })

                        if (!response?.ok) {
                            onComplete(response?.error);
                            return
                        }

                        dispatch(saveLoginHandler({
                            ...account, login: true,
                            encKey: user.key
                        }));
                        handleSwitchSuccess && handleSwitchSuccess();
                        saveSessionKey('');
                        if (isLogin)
                            toast.success(`Login successsful with private ${user.type} key`);
                        else
                            toast.success(`Successfully switched to ${user.username}`);




                        onComplete();
                    })
                    .catch((error) => {
                        onComplete(String(error));

                    });
            }
        } catch (e) {
            onComplete(String(e));
        }
    }

    const isDefault = (defaultAccount?.username === user.username && defaultAccount?.type === user.type);

    return <Card
        className={twMerge('w-full bg-foreground/10', props.className)}>
        <CardBody className={twMerge('flex flex-row gap-2  items-center', props.className)}>
            <SAvatar
                size='xs'
                username={user.username} />
            <div>
                <p className='flex flex-row text-sm gap-1 items-center'>{user.username}
                    <Chip variant='flat' size='sm' title={user.type} className=' justify-center'
                        color={keysColorMap[user.type]}>
                        {user.type[0]}
                    </Chip>
                </p>
                {isDefault ?
                    <Chip color="success" size="sm" variant="flat">
                        Active
                    </Chip> :
                    <Button size='sm'
                        isLoading={switching}
                        isDisabled={switching || isDisabled}
                        radius='full'
                        onClick={handleSwitch}
                        className='min-w-0  h-6 bg-foreground/20'>
                        {switchText ?? 'Switch'}
                    </Button>}


            </div>
        </CardBody>
    </Card>

}
)