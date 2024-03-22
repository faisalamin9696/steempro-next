import React, { useEffect, useState } from "react";
import {
    Modal, ModalContent,
    useDisclosure, ModalHeader, ModalBody
} from "@nextui-org/modal";
import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import { Spinner } from '@nextui-org/spinner';
import { Checkbox } from '@nextui-org/checkbox';
import { Input } from '@nextui-org/input';

import { useAppSelector, useAppDispatch, awaitTimeout } from "@/libs/constants/AppFunctions";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { getKeyType } from "@/libs/steem/condenser";
import { getAuthorExt } from "@/libs/steem/sds";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import { getResizedAvatar } from "@/libs/utils/image";
import { getSettings, getCredentials, saveSessionKey, validatePassword, saveCredentials, sessionKey, getAllCredentials } from "@/libs/utils/user";
import { useLogin } from "./useLogin";
import { toast } from "sonner";
import { signIn, useSession } from 'next-auth/react'
import { getAuth, signInAnonymously } from "firebase/auth";
import AccountItemCard from "./AccountItemCard";
import Link from "next/link";
import { SignupLink } from "@/libs/constants/AppConstants";

interface Props {
    open: boolean;
    onClose: () => void;
    onLoginSuccess?: (auth: User) => void;
    isNew?: boolean;

}


export default function AuthModal(props: Props) {
    let { open, onLoginSuccess, isNew } = props;
    const [isShow, setIsShow] = useState(true);
    const { isOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    let [username, setUsername] = useState('');
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const [key, setKey] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const [avatar, setAvatar] = useState('');
    const { data: session, status } = useSession();
    const [isCurrent, setIsCurrent] = React.useState(false);
    const isLocked = status === 'authenticated' && !sessionKey;
    const [accounts, setAccounts] = useState<User[]>();


    useEffect(() => {
        const timeOut = setTimeout(() => {
            username = username.trim().toLowerCase();
            setAvatar(username)
        }, 1000);

        return () => clearTimeout(timeOut)
    }, [username])

    useEffect(() => {

        const allCredentials = getAllCredentials();
        setAccounts(allCredentials);

        const timeOut = setTimeout(() => {
            setIsShow(false);
        }, 1000);

        return () => clearTimeout(timeOut);
    }, [])

    function handleOnClose() {
        onClose();
        if (props.onClose)
            props.onClose();

    }

    function clearAll() {
        setUsername('');
        setKey('');
        setPassword('');
        setPassword2('');
    }

    async function handleUnlock() {
        if (!password) {
            toast.info('Enter the password');
            return
        }


        setLoading(true);
        await awaitTimeout(3);

        const credentials = getCredentials(password);
        if (!credentials?.key) {
            toast.error('Invalid credentials');

            return
        }


        const enc = saveSessionKey(password);
        toast.success('Unlocked');
        onLoginSuccess && onLoginSuccess({ ...credentials, key: enc });
        handleOnClose();
        clearAll();
        setLoading(false);


    }

    function onComplete(error?: string | null) {
        setLoading(false);
        if (error)
            toast.error(error);

    }
    async function handleLogin() {
        username = username.trim().toLowerCase();

        const usernameError = validate_account_name(username);
        if (!username || usernameError) {
            toast.info(usernameError ?? 'Invalid username');
            return
        }

        if (!key) {
            toast.info('Invalid private key');
            return
        }

        if (!password) {
            toast.info('Enter the password');
            return
        }

        if (!password || password !== password2) {
            toast.info('Password does not matched');
            return
        }

        if (!validatePassword(password)) {
            toast.info('Weak password. Please use a combination of uppercase and lowercase letters, numbers, and special characters');
            return
        }

        setLoading(true);
        await awaitTimeout(3);
        try {
            const account = await getAuthorExt(username);
            if (account) {
                const keyType = getKeyType(account, key);

                if (keyType) {

                    if (!isNew) {
                        const firebaseAuth = getAuth();

                        signInAnonymously(firebaseAuth)
                            .then(async () => {

                                const auth = saveCredentials(username,
                                    key, password, keyType.type);

                                if (!auth) {
                                    onComplete('Something went wrong!');
                                    return
                                }

                                const response = await signIn('credentials', {
                                    username,
                                    redirect: false
                                })

                                if (!response?.ok) {
                                    onComplete(response?.error);
                                    return
                                }
                                saveSessionKey(password);
                                dispatch(saveLoginHandler({
                                    ...account, login: true,
                                    encKey: auth?.key
                                }));
                                onLoginSuccess && onLoginSuccess({
                                    username,
                                    key: auth?.key ?? '',
                                    type: keyType.type,
                                    memo: auth?.memo || ''
                                });
                                handleOnClose();
                                clearAll();
                                toast.success(`Login successsful with private ${keyType.type} key`);
                                onComplete();
                            })
                            .catch((error) => {
                                onComplete(String(error));

                            });
                    }
                    else {
                        const auth = saveCredentials(username,
                            key, password, keyType.type, isCurrent);
                        if (auth) {
                            if (isCurrent) {

                                const response = await signIn('credentials', {
                                    username,
                                    redirect: false
                                })

                                if (!response?.ok) {
                                    onComplete(response?.error);
                                    return
                                }
                                saveSessionKey(password);
                                dispatch(saveLoginHandler({
                                    ...account, login: true,
                                    encKey: auth?.key
                                }));
                                onLoginSuccess && onLoginSuccess({
                                    username,
                                    key: auth?.key ?? '',
                                    type: keyType.type,
                                    memo: auth?.memo || ''
                                });
                                toast.success(`Login successsful with private ${keyType.type} key`);

                            } else toast.success(`${auth?.username} added successfully`);

                            handleOnClose();
                            clearAll();
                            onComplete();

                        }
                        else {
                            onComplete('Something went wrong!');
                        }


                    }





                } else {
                    onComplete(`Invalid credentials`);
                }

            }
        } catch (e) {
            onComplete(String(e));
        }

    }

    return (
        <>
            <Modal
             className=' mt-4'
                scrollBehavior='inside'
                placement='top-center'
                size='md'
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isLocked && !isNew) {
                        handleUnlock();
                        return
                    }
                    handleLogin();
                }}
                backdrop={'opaque'}
                isOpen={open}
                hideCloseButton={loading}
                isDismissable={!loading}
                onClose={handleOnClose}>

                <ModalContent>

                    {(onClose) => (
                        <>
                            {isShow ? null : <ModalHeader className="flex flex-col gap-1">
                                {(isLocked && !isNew) ? 'Locked' : 'Log in'}
                            </ModalHeader>}
                            <ModalBody>
                                <div className="flex flex-col w-full">
                                    {isShow ?
                                        <Spinner className=" self-center m-auto" />
                                        :
                                        (isLocked && !isNew) ?
                                            <form className="flex flex-col gap-4">

                                                <p className="text-md font-bold flex items-center space-x-2">
                                                    <p>Hi, {loginInfo.name}</p>
                                                    <Avatar
                                                        src={getResizedAvatar(loginInfo.name)}
                                                        size="sm" /></p>

                                                <Input
                                                    size="sm"
                                                    autoFocus
                                                    value={password}
                                                    isRequired
                                                    onValueChange={setPassword}
                                                    isDisabled={loading}

                                                    label="Encryption password"
                                                    placeholder="Enter password to unlock account"
                                                    type="password"
                                                />


                                                <div className="flex gap-2 items-center">

                                                    <Button color="danger" variant="light"
                                                        onPress={onClose}
                                                        isDisabled={loading}>
                                                        Cancel
                                                    </Button>

                                                    <Button fullWidth color="primary"
                                                        isLoading={loading}
                                                        onPress={handleUnlock}
                                                        isDisabled={loading}>
                                                        Unlock
                                                    </Button>
                                                </div>
                                            </form>
                                            :
                                            <form className="flex flex-col gap-4">
                                                <Input isRequired
                                                    size="sm"
                                                    label="Username"
                                                    autoFocus
                                                    value={username}
                                                    endContent={<Avatar
                                                        src={getResizedAvatar(avatar)}
                                                        size="sm" />}
                                                    onValueChange={setUsername}
                                                    isDisabled={loading}

                                                    placeholder="Enter your username"
                                                    type='text' />
                                                <Input
                                                    size="sm"
                                                    value={key}
                                                    onValueChange={setKey}
                                                    isDisabled={loading}

                                                    isRequired
                                                    label="Private key"
                                                    placeholder="Enter your private posting key"
                                                    type="password"
                                                />

                                                <div className="flex flex-row gap-2 items-center">
                                                    <Input
                                                        size="sm"
                                                        value={password}
                                                        isRequired
                                                        isDisabled={loading}

                                                        onValueChange={setPassword}

                                                        label="Encryption password"
                                                        placeholder="Enter enc. password"
                                                        type="password"
                                                    />

                                                    <Input
                                                        size="sm"
                                                        value={password2}
                                                        onValueChange={setPassword2}
                                                        isRequired
                                                        isDisabled={loading}
                                                        label="Confirm password"
                                                        placeholder="Re-enter password"
                                                        type="password"
                                                    />
                                                </div>

                                                {isNew &&
                                                    <Checkbox isSelected={isCurrent}
                                                        onValueChange={setIsCurrent}>
                                                        set as default
                                                    </Checkbox>}

                                                <p className="text-start text-small">
                                                    Need to create an account?{" "}
                                                    <Link href={SignupLink} target='_blank'>
                                                        Sign up
                                                    </Link>
                                                </p>
                                                <div
                                                    className="flex flex-row gap-2 overflow-x-auto p-1">
                                                    {!!!loginInfo.name && accounts?.map(user => {
                                                        return <div className="w-fit" key={`${user.username}-${user.type}`}>
                                                            <AccountItemCard
                                                                switchText="Login" isDisabled={loading}
                                                                user={user} isLogin
                                                                className="px-[2px] py-1 rounded-lg shadow-none"
                                                                handleSwitchSuccess={() => {
                                                                    {
                                                                        handleOnClose();
                                                                        clearAll();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    })}
                                                </div>
                                                <div className="flex gap-2 justify-end">

                                                    <Button color="danger" variant="light"
                                                        onPress={onClose}
                                                        isDisabled={loading}>
                                                        Cancel
                                                    </Button>


                                                    <Button fullWidth color="primary"
                                                        isLoading={loading}
                                                        onPress={handleLogin}
                                                        isDisabled={loading}>
                                                        {isNew ? 'Add account' : 'Login'}
                                                    </Button>
                                                </div>
                                            </form>

                                    }

                                    {/* <Tab key="sign-up" title="Sign up">
                                                <form className="flex flex-col gap-4 h-[300px]">
                                                    <Input isRequired label="Name" placeholder="Enter your name" type="password" />
                                                    <Input isRequired label="Email" placeholder="Enter your email" type="email" />
                                                    <Input
                                                        isRequired
                                                        label="Password"
                                                        placeholder="Enter your password"
                                                        type="password"
                                                    />
                                                    <p className="text-center text-small">
                                                        Already have an account?{" "}
                                                        <Link size="sm"
                                                            onPress={() => setSelected('login')}>
                                                            Login
                                                        </Link>
                                                    </p>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button fullWidth color="primary" >
                                                            Sign up
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Tab> */}


                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal >
        </>

    );
}