import { TokenCard } from '@/components/TokenCard';
import TransferModal from '@/components/TransferModal';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { vestToSteem } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import { DropdownMenu, DropdownItem } from '@nextui-org/dropdown';
import React, { Key, useState } from 'react'
import PowerDownModal from '@/components/PowerDownModal';
import { Chip } from '@nextui-org/chip';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';

export type SteemTokens = 'steem' | 'steem_power' | 'steem_dollar' | 'saving';


const tokens = {
    steem: {
        symbol: 'STEEM',
        title: 'STEEM',
        description: `Tradeable tokens that may be transferred anywhere at anytime.
        Steem can be converted to STEEM POWER in a process called powering up.`
    },
    steem_power: {
        symbol: undefined,
        title: 'STEEM POWER',
        description: `Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.
        Part of users's STEEM POWER is currently delegated. Delegation is donated for influence or to help new users perform actions on Steemit. Your delegation amount can fluctuate.
        STEEM POWER increases at an APR of approximately 2.77%, subject to blockchain variance. See FAQ for details.`
    },
    steem_dollar: {
        symbol: undefined,
        title: "STEEM DOLLARS",
        description: `Tradeable tokens that may be transferred anywhere at anytime.`
    },
    saving: {
        symbol: undefined,
        title: "SAVINGS",
        description: `Balances subject to 3 day withdraw waiting period.`
    }
}

const steem_power_desc = (username: string) => `Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.
Part of ${username}'s STEEM POWER is currently delegated. Delegation is donated for influence or to help new users perform actions on Steemit. Your delegation amount can fluctuate.
STEEM POWER increases at an APR of approximately 2.77%, subject to blockchain variance. See FAQ for details.`;


export default function BalanceTab({ data }: { data: AccountExt }) {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    let { username } = usePathnameClient();

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const isSelf = !!loginInfo.name && (loginInfo.name === (username));

    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    let [key, setKey] = useState<SteemTokens>();
    const [powerDownModal, setPowerDownModal] = useState<{
        isOpen: boolean,
        cancel?: boolean
    }>({
        isOpen: false,
    });

    const [transferModal, setTransferModal] = useState<{
        isOpen: boolean,
        savings?: boolean,
        powerup?: boolean,
        delegation?: boolean,
        asset: string,
    }>({
        isOpen: false,
        savings: false,
        powerup: false,
        delegation: undefined,
        asset: 'STEEM',
    });



    function handleInfo(tokenKey: SteemTokens) {
        key = tokenKey;
        setKey(tokenKey);
        onOpen();
    }




    function handleAction(key: Key) {
        key = key.toString();

        switch (String(key)) {
            case 'transfer-steem':
                setTransferModal({ isOpen: true, asset: 'STEEM' });
                break;
            case 'transfer-sbd':
                setTransferModal({ isOpen: true, asset: 'SBD' });

                break;
            case 'savings-steem':
                setTransferModal({ isOpen: true, savings: true, asset: 'STEEM' });
                break;
            case 'savings-sbd':
                setTransferModal({ isOpen: true, savings: true, asset: 'SBD' });
                break;
            case 'power-up':
                setTransferModal({ isOpen: true, powerup: true, asset: 'STEEM' });
                break;

            case 'delegation':
                setTransferModal({ isOpen: true, delegation: true, asset: 'VESTS' });
                break;

            case 'power-down':
                setPowerDownModal({ isOpen: true });
                break;
            case 'cancel-power-down':
                setPowerDownModal({ isOpen: true, cancel: true });
                break;
        }

    }


    return (
        <div className=' gap-4 grid grid-cols-1 md:grid-cols-2'>

            {data && <>
                <TokenCard tokenKey='steem' symbol={tokens.steem.symbol}
                    description={tokens.steem.description}
                    title={tokens.steem.title}
                    endContent={<div className='flex gap-2'>
                        <p>{data.balance_steem?.toLocaleString()}</p>
                    </div>}

                    actionContent={isSelf && <DropdownMenu
                        aria-labelledby={`steem`}

                        onAction={handleAction}>
                        <DropdownItem key="transfer-steem">Transfer</DropdownItem>
                        <DropdownItem key="savings-steem">Transfer to Savings</DropdownItem>
                        <DropdownItem key="power-up">Power Up</DropdownItem>
                    </DropdownMenu>

                    }
                    handleInfoClick={handleInfo}
                />

                <TokenCard tokenKey='steem_power' symbol={tokens.steem_power.symbol}
                    description={steem_power_desc('')}
                    title={tokens.steem_power.title}

                    endContent={<div className='flex flex-col gap-2 items-end'>
                        <p>{vestToSteem(data.vests_own, globalData.steem_per_share)?.toLocaleString()}</p>
                        <div className='flex gap-2 items-center '>
                            {!!data.vests_out && <Chip title='Outgoing delegation'
                                radius='lg' className='px-0 pl-1 h-6 min-w-0' variant='flat' color='warning'
                                startContent={<IoMdRemove size={12} />}>
                                <p className='text-tiny'>{vestToSteem(data.vests_out, globalData.steem_per_share)?.toLocaleString()}</p>
                            </Chip>}

                            {!!data.vests_in && <Chip title='Incoming delegation' radius='lg'
                                className='px-0 pl-1 h-6 min-w-0' variant='flat' color='success'
                                startContent={<IoMdAdd size={14} />}>
                                <p className='text-tiny flex'>{vestToSteem(data.vests_in, globalData.steem_per_share)?.toLocaleString()}</p>
                            </Chip>}
                        </div>

                    </div>}

                    actionContent={isSelf && <DropdownMenu
                        aria-labelledby={`steem-power`}
                        onAction={handleAction}>
                        <DropdownItem key="delegation">Delegate</DropdownItem>
                        <DropdownItem key="power-down">Power Down</DropdownItem>
                        <DropdownItem className={!!loginInfo.powerdown ? 'block' : 'hidden'}
                            key="cancel-power-down">Cancel Power Down</DropdownItem>

                    </DropdownMenu>
                    }
                    handleInfoClick={handleInfo}

                />


                <TokenCard tokenKey='steem_dollar'
                    description={tokens.steem_dollar.description}
                    title={tokens.steem_dollar.title}

                    endContent={<div>
                        <p>${data.balance_sbd?.toLocaleString()} SBD</p>
                    </div>}

                    actionContent={isSelf && <DropdownMenu
                        aria-labelledby={`steem-dollar`}
                        onAction={handleAction}>
                        <DropdownItem key="transfer-sbd">Transfer</DropdownItem>
                        <DropdownItem key="savings-sbd">Transfer to Savings</DropdownItem>
                    </DropdownMenu>
                    }
                    handleInfoClick={handleInfo}

                />

                <TokenCard
                    tokenKey={'saving'}
                    description={tokens.saving.description}
                    title={tokens.saving.title}
                    endContent={<div className='flex flex-col items-end'>
                        <p>${data.savings_steem?.toLocaleString()} STEEM</p>
                        <p>${data.savings_sbd?.toLocaleString()} SBD</p>
                    </div>}
                    handleInfoClick={handleInfo}

                />

            </>

            }

            {transferModal.isOpen && <TransferModal
                asset={transferModal.asset as any}
                powewrup={transferModal.powerup}
                savings={transferModal.savings}
                delegation={transferModal.delegation}
                delegatee={isSelf ? '' : username}
                isOpen={transferModal.isOpen}
                onOpenChange={(isOpen) => setTransferModal({ ...transferModal, isOpen: isOpen })}
            />}

            {powerDownModal.isOpen && <PowerDownModal
                isOpen={powerDownModal.isOpen}
                cancel={powerDownModal.cancel}
                onOpenChange={(isOpen) => setPowerDownModal({ isOpen: isOpen })}
            />}

            {isOpen && <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        key &&
                        <>
                            <ModalHeader className="flex flex-col gap-1">{tokens[key]['title']}</ModalHeader>
                            <ModalBody>
                                <p>
                                    {tokens[key]['description']}
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onClick={onClose}>
                                    Close
                                </Button>
                                {/* <Button color="primary" onClick={onClose}>
                                    Action
                                </Button> */}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>}
        </div>
    )
}
