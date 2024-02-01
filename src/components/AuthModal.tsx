import React, { useEffect, useState } from "react";
import {
    Input, Button, Modal, ModalContent,
    useDisclosure, Avatar, Spinner, ModalHeader, ModalBody
} from "@nextui-org/react";
import { useAppSelector, useAppDispatch, awaitTimeout } from "@/libs/constants/AppFunctions";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { getKeyType } from "@/libs/steem/condenser";
import { getAuthorExt } from "@/libs/steem/sds";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import { getResizedAvatar } from "@/libs/utils/image";
import { getSettings, getCredentials, saveSessionKey, validatePassword, saveCredentials } from "@/libs/utils/user";
import { useLogin } from "./useLogin";
import { toast } from "sonner";
import { signIn } from 'next-auth/react'
import { encryptPrivateKey } from "@/libs/utils/encryption";

interface Props {
    open: boolean;
    onClose: () => void;
    onLoginSuccess?: (auth: User) => void;
    isLocked?: boolean | null;

}


export default function AuthModal(props: Props) {
    let { open, onLoginSuccess, isLocked } = props;

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [isShow, setIsShow] = useState(true);
    const { isOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [key, setKey] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const [avatar, setAvatar] = useState('');
    const { credentials } = useLogin();


    useEffect(() => {
        const timeOut = setTimeout(() => {
            setAvatar(username)
        }, 1000);

        return () => clearTimeout(timeOut)
    }, [username])

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsShow(false);
        }, 1000);

        return () => clearTimeout(timeOut)
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
        if (credentials?.key) {
            saveSessionKey(password);
            toast.success('Unlocked');
            onLoginSuccess && onLoginSuccess(credentials);
            handleOnClose();
            clearAll();


        } else {
            toast.error('Invalid password');

        }
        setLoading(false);


    }
    async function handleLogin() {

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

        // const response = await fetch('/api/auth/register', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         username,
        //         password,
        //         password2,
        //         key
        //     })
        // });

        // console.log(1122, response)




        // setLoading(false);

        try {
            const account = await getAuthorExt(username);
            if (account) {
                const keyType = getKeyType(account, key);
                if (keyType) {
                    const response = await signIn('credentials', {
                        username,
                        redirect: false
                    })

                    if (response?.ok) {
                        const auth = saveCredentials(username, key, password);
                        saveSessionKey(password);
                        dispatch(saveLoginHandler({ ...account, login: true, encKey: auth?.key }));
                        onLoginSuccess && onLoginSuccess({ username, key: auth?.key ?? '' });
                        handleOnClose();
                        clearAll();
                        toast.success(`Login successsful with private ${keyType.type} key`);
                        return
                    }
                    toast.error(response?.error);



                } else {
                    toast.error(`Invalid credentials`);

                }

            }
        } catch (e) {
            console.log('Error', e)
            toast.error(String(e));
        } finally {
            setLoading(false);

        }

    }

    return (
        <>
            <Modal placement='center'
                scrollBehavior='inside'
                size='md'
                backdrop={'opaque'}
                isOpen={open}
                isDismissable={!loading}
                motionProps={{
                    variants: {
                        enter: {

                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    }
                }}
                onClose={handleOnClose}>

                <ModalContent>

                    {(onClose) => (
                        <>
                            {isShow ? null : <ModalHeader className="flex flex-col gap-1">
                                {isLocked ? 'Locked' : 'Log in'}
                            </ModalHeader>}
                            <ModalBody>
                                <div className="flex flex-col w-full">
                                    {isShow ?
                                        <Spinner className=" self-center m-auto" />
                                        :
                                        isLocked ?
                                            <form className="flex flex-col gap-4">

                                                <p className="text-md font-bold flex items-center space-x-2">
                                                    <p>Hi, {loginInfo.name || credentials?.username}</p>
                                                    <Avatar
                                                        src={getResizedAvatar(loginInfo.name || credentials?.username || '')}
                                                        size="sm" /></p>

                                                <Input
                                                    autoFocus
                                                    value={password}
                                                    isRequired
                                                    onValueChange={setPassword}
                                                    isDisabled={loading}

                                                    label="Encryption password"
                                                    placeholder="Enter password to unlock account"
                                                    type="password"
                                                />


                                                <div className="flex gap-2 justify-end">
                                                    <Button fullWidth color="primary"
                                                        isLoading={loading}
                                                        onPress={handleUnlock}
                                                        disabled={loading}>
                                                        Unlock
                                                    </Button>
                                                </div>
                                            </form>
                                            :
                                            <form className="flex flex-col gap-4">
                                                <Input isRequired label="Username"
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
                                                    value={key}
                                                    onValueChange={setKey}
                                                    isDisabled={loading}

                                                    isRequired
                                                    label="Private key"
                                                    placeholder="Enter your private key"
                                                    type="password"
                                                />

                                                <Input
                                                    value={password}
                                                    isRequired
                                                    isDisabled={loading}

                                                    onValueChange={setPassword}

                                                    label="Encryption password"
                                                    placeholder="Enter password to encrypt key"
                                                    type="password"
                                                />

                                                <Input
                                                    value={password2}
                                                    onValueChange={setPassword2}
                                                    isRequired
                                                    isDisabled={loading}
                                                    label="Confirm encryption password"
                                                    placeholder="Re-enter encryption password"
                                                    type="password"
                                                />
                                                {/* <p className="text-center text-small">
           Need to create an account?{" "}
           <Link
               size="sm" onPress={() => setSelected("sign-up")}>
               Sign up
           </Link>
       </p> */}
                                                <div className="flex gap-2 justify-end">
                                                    <Button fullWidth color="primary"
                                                        isLoading={loading}
                                                        onPress={handleLogin}
                                                        disabled={loading}>
                                                        Login
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