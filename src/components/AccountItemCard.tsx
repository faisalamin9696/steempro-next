import { addToCurrent, saveSessionKey } from '@/libs/utils/user';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import React, { memo, useState } from 'react'
import SAvatar from './SAvatar';
import { useLogin } from './useLogin';
import { useAppDispatch } from '@/libs/constants/AppFunctions';
import { getAuthorExt } from '@/libs/steem/sds';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';

type Props = {
    user: User;
    defaultAccount?: string;
    handleSwitchSuccess?: () => void;
}

export default memo(function AccountItemCard(props: Props) {
    const { defaultAccount, user, handleSwitchSuccess } = props;
    const { authenticateUser, isAuthorized } = useLogin();
    const dispatch = useAppDispatch();

    const [switching, setSwitching] = useState(false);



    function onComplete(error?: string | null) {
        setSwitching(false);
        if (error)
            toast.error(error);
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

                        addToCurrent(user.username, user.key, user.type);


                        const response = await signIn('credentials', {
                            username: user.username,
                            redirect: false
                        })

                        if (!response?.ok) {
                            onComplete(response?.error);
                            return
                        }
                        saveSessionKey('');
                        dispatch(saveLoginHandler({
                            ...account, login: true,
                            encKey: user.key
                        }));
                        handleSwitchSuccess && handleSwitchSuccess();
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

    const isDefault = defaultAccount === user.username;

    return <Card
        className='w-full bg-foreground/10'>
        <CardBody className='flex flex-row gap-2  items-center'>
            <SAvatar
                size='xs'
                username={user.username} />
            <div>
                <p className='flex flex-row text-sm gap-1'>{user.username}
                    <Chip title={user.type}>
                        {user.type[0]}
                    </Chip>
                </p>
                {isDefault ?
                    <Chip color="success" size="sm" variant="flat">
                        Active
                    </Chip> :
                    <Button size='sm'
                        isLoading={switching}
                        isDisabled={switching}
                        radius='full'
                        onPress={handleSwitch}
                        className='min-w-0  h-6 bg-foreground/20'>
                        Switch
                    </Button>}


            </div>
        </CardBody>
    </Card>

}
)