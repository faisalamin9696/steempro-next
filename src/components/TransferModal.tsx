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
import clsx from "clsx";

type AssetTypes = 'STEEM' | 'SBD' | 'VESTS';

type Props = {
    isOpen?: boolean;
    asset: AssetTypes;
    onOpenChange?: (isOpen: boolean) => void;
    savings?: boolean;
    powewrup?: boolean;
    delegation?: boolean;
    delegatee?: string
} & (
        { delegation: boolean; delegatee: string } |
        { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; }
    );



const TransferModal = (props: Props): JSX.Element => {
    const { savings, powewrup, delegation, delegatee } = props;
    const [asset, setAsset] = useState(props.asset);
    const [basic, setBasic] = useState(savings || powewrup);
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);

    const dispatch = useAppDispatch();

    const [confirmCheck, setConfirmCheck] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: session } = useSession();
    const { authenticateUser, isAuthorized } = useLogin();

    let [from, setFrom] = useState(session?.user?.name || '');
    let [to, setTo] = useState(delegation ? (delegatee || '') : (savings || powewrup) ? session?.user?.name || '' : '');
    let [amount, setAmount] = useState('');
    let [memo, setMemo] = useState('');
    const [toImage, setToImage] = useState('');

    const availableBalance = asset === 'VESTS' ?
        vestToSteem(loginInfo.vests_own, globalData.steem_per_share) : asset === 'STEEM' ? loginInfo.balance_steem
            : loginInfo.balance_sbd;


    useEffect(() => {
        const timeout = setTimeout(() => {
            setToImage(to.trim()?.toLowerCase());
        }, 500);

        return () => clearTimeout(timeout);
    }, [to]);


    const transferMutation = useMutation({

        mutationFn: (data: { key: string, options: Transfer }) =>
            transferAsset(loginInfo, data.key, data.options),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            if (variables.options.unit === 'SBD') {
                dispatch(saveLoginHandler({ ...loginInfo, balance_sbd: loginInfo.balance_sbd - Number(variables.options.amount) }))
            } else {
                dispatch(saveLoginHandler({ ...loginInfo, balance_steem: loginInfo.balance_steem - Number(variables.options.amount) }))

            }
            toast.success(`${amount} ${asset} transfered to ${to}`)

        },
    });

    const savingsMutation = useMutation({

        mutationFn: (data: { key: string, options: Transfer }) =>
            transferToSavings(loginInfo, data.key, data.options),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            if (variables.options.unit === 'SBD') {
                dispatch(saveLoginHandler({ ...loginInfo, savings_sbd: loginInfo.savings_sbd - Number(variables.options.amount) }))
            } else {
                dispatch(saveLoginHandler({ ...loginInfo, savings_steem: loginInfo.savings_steem - Number(variables.options.amount) }))

            }
            toast.success(`${amount} ${asset} transfered to ${to}'s savings`)

        },
    });

    const vestingMutation = useMutation({

        mutationFn: (data: { key: string, options: Transfer }) =>
            transferToVesting(loginInfo, data.key, data.options),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(saveLoginHandler({
                ...loginInfo,
                balance_steem: loginInfo.balance_steem - Number(variables.options.amount),
                vests_own: loginInfo.vests_own + steemToVest(Number(variables.options.amount), globalData.steem_per_share)
            }));


            toast.success(`${amount} ${asset} powered up to ${to}`)

        },
    });

    const delegateMutation = useMutation({

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
        memo = memo.trim();

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

        if (savings)
            savingsMutation.mutate({
                key: credentials.key, options: {
                    from,
                    to,
                    amount: Number(amount),
                    memo, unit: asset, time: moment.now()
                }
            });


        if (powewrup)
            vestingMutation.mutate({
                key: credentials.key, options: {
                    from,
                    to,
                    amount: Number(amount),
                    memo, unit: asset, time: moment.now()
                }
            });

        if (!savings && !powewrup)
            transferMutation.mutate({
                key: credentials.key, options: {
                    from,
                    to,
                    amount: Number(amount),
                    memo, unit: asset, time: moment.now()
                }
            });

        if (delegation)
            delegateMutation.mutate({
                key: credentials.key, options: {
                    delegatee: to,
                    amount: Number(amount),
                }
            });

    }


    const isPending = transferMutation.isPending || savingsMutation.isPending || vestingMutation.isPending;

    return (<Modal isOpen={props.isOpen || isOpen}
        placement='top-center'
        closeButton={!isPending}
        isDismissable={false}
        onOpenChange={props.onOpenChange || onOpenChange}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">{delegation ? 'Delegate to Account' : powewrup ? 'Convert to STEEM POWER' : `Transfer to ${savings ? 'Savings' : 'Account'}`}</ModalHeader>
                    <ModalBody className=" flex flex-col gap-6">

                        <div className="flex gap-2 items-center">

                            <Input label="From" size="sm" isReadOnly
                                isRequired
                                value={from} onValueChange={setFrom}
                                endContent={<SAvatar size="xs" username={from} />}

                            />
                            {(!basic || delegation) &&
                                <Input isRequired label="To" size="sm" value={to} onValueChange={setTo}
                                    endContent={<SAvatar size="xs" username={toImage} />} />
                            }

                        </div>

                        <Input
                            isRequired
                            label="Amount" size="sm"
                            value={amount} onValueChange={setAmount}
                            type="number"
                            min={0}
                            step={0.001}
                            endContent={<Select
                                aria-label="Select asset"
                                variant='flat'
                                onChange={(key) => {
                                    setAsset(key.target.value as AssetTypes)
                                }}
                                selectedKeys={[asset]}
                                isDisabled={powewrup || delegation}
                                size="sm"

                                placeholder="Asset"
                                className=" max-w-[100px]"
                                selectorIcon={delegation && <></>}

                                classNames={{ value: 'text-tiny', innerWrapper: delegation ? ('w-15') : ' w-10' }}

                            >
                                <SelectItem className="text-xs" key={'STEEM'} value={'STEEM'}>
                                    {'STEEM'}
                                </SelectItem>
                                <SelectItem key={'SBD'} value={'SBD'}>
                                    {'SBD'}
                                </SelectItem>
                                <SelectItem key={'VESTS'} className={clsx(delegation ? 'block' : "hidden")} value={'VESTS'}>
                                    {'STEEM POWER'}
                                </SelectItem>
                            </Select>}
                            description={<div className="ps-1 flex flex-row gap-4 items-center">
                                <p>Available balance: </p>
                                <button className=" font-mono" onClick={() => {
                                    setAmount(availableBalance?.toFixed(3)?.toString())
                                }}>{availableBalance?.toLocaleString()} {delegation ? 'SP' : asset}</button>
                            </div>}
                        />

                        {!savings && !powewrup && !delegation && <Textarea
                            spellCheck={false}
                            value={memo}
                            onValueChange={setMemo}
                            label="Memo"
                        />}


                        <Checkbox size="sm" isSelected={confirmCheck}
                            onValueChange={setConfirmCheck}
                        >Confirm Transfer</Checkbox>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}
                            isDisabled={isPending}>
                            Cancel
                        </Button>

                        {(savings || powewrup) &&
                            <Button onPress={() => setBasic(!basic)}
                                variant='flat'
                                isDisabled={isPending}>
                                {basic ? 'Advance' : 'Basic'}
                            </Button>}

                        <Button color="primary" onPress={handleTransfer}
                            isLoading={isPending}
                            isDisabled={!confirmCheck || isPending}>
                            {delegation ? 'Delegate' : powewrup ? 'Power Up' : 'Transfer'}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>)
}

export default TransferModal