import { addToCurrent, getAllCredentials, getCredentials, saveCredentials } from '@/libs/utils/user';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Card, CardBody, Spinner, Chip } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import SAvatar from './SAvatar';
import { useLogin } from './useLogin';
import AccountItemCard from './AccountItemCard';


type Props = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function AccountsModal(props: Props) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [accounts, setAccounts] = useState<User[]>();
    const [defaultAcc, setDefaultAcc] = useState('');
    const [isShow, setIsShow] = useState(true);

    const { authenticateUser, isAuthorized } = useLogin();
    useEffect(() => {
        const credentials = getCredentials();
        if (credentials?.username) {
            setDefaultAcc(credentials.username);
            const allCredentials = getAllCredentials();
            
            // Find the index of the object with the username
            const index = allCredentials.findIndex(account => account.username === (credentials.username));
            if (index !== -1) {
                const activeAccount = allCredentials.splice(index, 1)[0];
                allCredentials.unshift(activeAccount);
            }

            setAccounts(allCredentials);
        }
        const timeOut = setTimeout(() => {
            setIsShow(false);
        }, 1000);

        return () => clearTimeout(timeOut);
    }, []);


    return (
        <div>
            <Modal
                placement='top'
                isOpen={props.isOpen ?? isOpen}
                onOpenChange={props.onOpenChange ?? onOpenChange}
                scrollBehavior={'inside'}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {isShow ?
                                <Spinner className=" self-center m-auto p-4" />
                                :
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        Accounts
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center'>
                                            {accounts?.map(user => {
                                                return <AccountItemCard key={user.username}
                                                    user={user}
                                                    defaultAccount={defaultAcc}
                                                    handleSwitchSuccess={() => {
                                                        props.onOpenChange(false);
                                                    }}

                                                />
                                            })}
                                        </div>


                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary"
                                            onPress={() => {
                                                onClose();
                                                authenticateUser(true);
                                            }}>
                                            Add Account
                                        </Button>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Close
                                        </Button>

                                    </ModalFooter>
                                </>
                            }
                        </>

                    )}
                </ModalContent>
            </Modal>
        </div >
    )
}