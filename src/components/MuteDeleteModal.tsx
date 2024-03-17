import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { deleteComment, mutePost } from '@/libs/steem/condenser';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { useLogin } from './useLogin';
import { getCredentials, getSessionKey } from '@/libs/utils/user';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    comment: Post | Feed;
    mute?: boolean;
    muteNote?: string;
    onNoteChange?: (note: string) => void;
}



export default function MuteDeleteModal(props: Props) {
    const { mute, onNoteChange, muteNote, comment } = props;
    const { isOpen, onOpenChange } = useDisclosure();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const dispatch = useAppDispatch();
    const { authenticateUser, isAuthorized } = useLogin();

    const muteMutation = useMutation({
        mutationFn: (data: {
            key: string, options: {
                notes?: string;
            }
        }) => mutePost(loginInfo, data.key, true, {
            community: comment.category, account: comment.author, permlink: comment.permlink,
            notes: data.options.notes
        }),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(addCommentHandler({ ...comment, is_muted: 1 }));
            props.onOpenChange(false)
            toast.success(`Muted`);

        },
    });


    const deleteMutation = useMutation({
        mutationFn: (key: string) => deleteComment(loginInfo, key, { author: comment.author, permlink: comment.permlink }),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(addCommentHandler({ ...comment, link_id: undefined }));
            props.onOpenChange(false)
            toast.success(`Deleted`);

        },
    });

    function handleAction() {

        authenticateUser();
        if (!isAuthorized())
            return
        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        if (mute) {
            muteMutation.mutate({ key: credentials.key, options: { notes: muteNote } });
            return
        }

        deleteMutation.mutate(credentials.key);

    }

    const isPending = deleteMutation.isPending || muteMutation.isPending;

    return (<Modal isDismissable={!isPending} hideCloseButton={isPending}
        isOpen={props.isOpen || isOpen} onOpenChange={props.onOpenChange || onOpenChange}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">{mute ? 'Mute' : 'Delete'} post/comment</ModalHeader>
                    <ModalBody className='flex flex-col gap-6'>

                        {<p>{mute ? 'Please provide a note regarding your decision to mute this content.' :
                            'Do you really want to delete this post/comment?'}</p>}

                        {mute && <Input maxLength={120} label='Notes'
                            value={muteNote} onValueChange={onNoteChange} />
                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}
                            isDisabled={isPending}>
                            Close
                        </Button>
                        <Button color="primary" onPress={handleAction}
                            isLoading={isPending}
                            isDisabled={(mute && !muteNote) || isPending} >
                            {mute ? 'Mute' : ' Delete'}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>)
}
