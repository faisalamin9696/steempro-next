import { useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { setUserRole, setUserRoleTitle, setUserTitle } from '@/libs/steem/condenser';
import { Role } from '@/libs/utils/community';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Select, SelectItem } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query';
import { KeyType } from 'crypto';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useLogin } from './useLogin';
import { getCredentials, getSessionKey } from '@/libs/utils/user';

type Props = {
    comment: Post | Feed;
    isOpen: boolean;
    onOpenChange?: (isOpen: boolean) => void;

}
export default function EditRoleModal(props: Props) {
    const { comment } = props;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    let [title, setTitle] = useState(comment.author_title);
    let [role, setRole] = useState<'muted' | 'guest' | 'member' | 'mod' | 'admin' | 'owner' | ''>(comment.author_role || 'guest');
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const observerRole = comment.observer_role;
    const isSameRole = comment.author_role === comment.observer_role;
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();


    let items = (Role.atLeast(observerRole, 'owner')) ?
        [
            { item: 'Admin', value: 'admin' },
            { item: 'Moderator', value: 'mod' },
            { item: 'Member', value: 'member' },
            { item: 'Guest', value: 'guest' },
            { item: 'Muted', value: 'muted' }
        ] : (Role.atLeast(observerRole, 'admin')) ? [
            { item: 'Moderator', value: 'mod' },
            { item: 'Guest', value: 'guest' },
            { item: 'Muted', value: 'muted' }
        ] : (Role.atLeast(observerRole, 'mod')) ? [
            { item: 'Member', value: 'member' },
            { item: 'Guest', value: 'guest' },
            { item: 'Muted', value: 'muted' }
        ] : []



    function handleSuccess() {
        dispatch(addCommentHandler({
            ...comment, author_role: role,
            author_title: title
        }))
        toast.success('Updated');
        onOpenChange();
    }
    function handleFailed(error: any) {
        toast.error('Failed: ' + String(error));
    }
    const roleTitleMutation = useMutation({
        mutationFn: (key: string) => setUserRoleTitle(loginInfo, key, {
            communityId: comment.category,
            account: comment.author,
            role: role || 'guest',
            title: title,
        }),
        onSuccess() {
            handleSuccess();
        },
        onError(error) { handleFailed(error) },
        onSettled() {
            setLoading(false);
        }
    });


    const roleMutation = useMutation({
        mutationFn: (key: string) => setUserRole(loginInfo, key, {
            communityId: comment.category,
            account: comment.author,
            role: role || 'guest',
        }),
        onSuccess() {
            handleSuccess();
        }, onError(error) { handleFailed(error) },
        onSettled() {
            setLoading(false);
        }
    });


    const titleMutation = useMutation({
        mutationFn: (key: string) => setUserTitle(loginInfo, key, {
            communityId: comment.category,
            account: comment.author,
            title: title,
        }),
        onSuccess() {
            handleSuccess();
        }, onError(error) { handleFailed(error) }, onSettled() {
            setLoading(false);
        }
    });

    function handleUpdate() {
        title = title?.trim();
        const isTitleChanged = title !== comment.author_title;
        const isRoleChanged = role !== (comment.author_role || 'guest');

        if (isTitleChanged || isRoleChanged) {
            authenticateUser();

            if (!isAuthorized())
                return

            setLoading(true);
            const credentials = getCredentials(getSessionKey());
            if (!credentials?.key) {
                toast.error('Something went wrong!')
                return
            }

            // update both title and role
            if (isTitleChanged && isRoleChanged) {
                roleTitleMutation.mutate(credentials.key);
                return
            }

            // update only title
            if (isTitleChanged && !isRoleChanged) {
                titleMutation.mutate(credentials.key);
                return
            }

            // update only role
            if (isRoleChanged && !isTitleChanged) {
                roleMutation.mutate(credentials.key);
                return
            }


        } else {
            toast.info('Nothing to update!');
        }


    }
    return (
        <Modal isOpen={props.isOpen ?? isOpen}
            onOpenChange={props.onOpenChange ?? onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Update Title, Role</ModalHeader>
                        <ModalBody>
                            <div className='flex flex-col gap-2'>

                                <p>{role}</p>
                                <Input
                                    maxLength={32}
                                    label='Title'
                                    labelPlacement='outside-left'
                                    classNames={{ base: 'items-center' }}
                                    value={title} onValueChange={setTitle} />

                                {!(Role.level(comment.observer_role) <= Role.level(comment.author_role))
                                    && <Select
                                        items={items}
                                        label="Role"
                                        className="max-w-xs"
                                        defaultSelectedKeys={[role]}
                                        disabledKeys={[comment.author_role]}
                                        labelPlacement='outside-left'
                                        onSelectionChange={(key) => setRole(key as any)}
                                        classNames={{ base: 'items-center' }}
                                    >
                                        {(item) => <SelectItem key={item?.value}>{item.item}</SelectItem>}
                                    </Select>}
                            </div>



                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onPress={handleUpdate}>
                                Update
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}