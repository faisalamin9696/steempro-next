import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from "@nextui-org/react";
import SAvatar from "./SAvatar";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useLogin } from "./useLogin";
import { useMutation } from "@tanstack/react-query";
import { delegateVestingShares, transferAsset, transferToSavings, transferToVesting } from "@/libs/steem/condenser";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import moment from "moment";
import { steemToVest, vestToSteem } from "@/libs/steem/sds";
import { isNumeric } from "@/libs/utils/helper";

type AssetTypes = 'STEEM' | 'SBD' | 'VESTS';

interface Props {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    delegatee?: string;
}



const DelegationModal = (props: Props): JSX.Element => {
    const { delegatee } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);

    const dispatch = useAppDispatch();

    const [confirmCheck, setConfirmCheck] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: session } = useSession();
    const { authenticateUser, isAuthorized } = useLogin();

    let [from, setFrom] = useState(session?.user?.name || '');
    let [to, setTo] = useState(delegatee || '');
    let [amount, setAmount] = useState('');
    const [toImage, setToImage] = useState('');

    const availableBalance = loginInfo.balance_steem;

    useEffect(() => {
        const timeout = setTimeout(() => {
            setToImage(to.trim()?.toLowerCase());
        }, 500);

        return () => clearTimeout(timeout);
    }, [to]);


    const delegateMutate = useMutation({

        mutationFn: (data: {
            key: string, options: {
                delegatee: string;
                amount: number;
            }
        }) =>
            delegateVestingShares(loginInfo, data.key, data.options),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(saveLoginHandler({ ...loginInfo, balance_sbd: loginInfo.balance_sbd - Number(variables.options.amount) }))


            toast.success(`${amount} SP delegated to ${to}`)

        },
    });

    async function handleTransfer() {
        from = from.trim().toLowerCase();
        to = to.trim().toLowerCase();
        amount = amount.trim();

        if (!to || !amount || !from) {
            toast.info('Some fields are empty');
            return
        }
        if (!isNumeric(amount)) {
            toast.info('Invalid amount');
            return
        }
        if (Number(amount) < 0.001) {
            toast.info('Use only 3 digits of precison');
            return

        }

        if (Number(amount) > availableBalance) {
            toast.info('Insufficient funds');
            return

        }
        authenticateUser();
        if (!isAuthorized()) {
            return
        }

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        delegateMutate.mutate({
            key: credentials.key, options: {
                delegatee: to,
                amount: Number(amount),
            }
        });

    }


    const isPending = delegateMutate.isPending

    return (<Modal isOpen={props.isOpen || isOpen}
        placement='top-center'
        closeButton={!isPending}
        isDismissable={false}
        onOpenChange={props.onOpenChange || onOpenChange}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Delegate to Account</ModalHeader>
                    <ModalBody className=" flex flex-col gap-6">

                        <div className="flex gap-2 items-center">

                            <Input label="From" size="sm" isReadOnly
                                isRequired
                                value={from} onValueChange={setFrom}
                                endContent={<SAvatar size="xs" username={from} />}

                            />

                            <Input isRequired label="To" size="sm" value={to} onValueChange={setTo}
                                endContent={<SAvatar size="xs" username={toImage} />} />


                        </div>

                        <Input
                            isRequired
                            label="Amount" size="sm"
                            value={amount} onValueChange={setAmount}

                            description={<div className="ps-1 flex flex-row gap-4 items-center">
                                <p>Available balance: </p>
                                <button className=" underline" onClick={() => {
                                    setAmount(availableBalance?.toString())
                                }}>{availableBalance} {'SP'}</button>
                            </div>}
                        />


                        <Checkbox size="sm" isSelected={confirmCheck}
                            onValueChange={setConfirmCheck}
                        >Confirm Transfer</Checkbox>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}
                            isDisabled={isPending}>
                            Cancel
                        </Button>



                        <Button color="primary" onPress={handleTransfer}
                            isLoading={isPending}
                            isDisabled={!confirmCheck || isPending}>
                            Delegate
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>)
}

export default DelegationModal