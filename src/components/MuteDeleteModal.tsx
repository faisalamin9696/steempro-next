"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { deleteComment, mutePost } from "@/libs/steem/condenser";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comment: Post | Feed;
  mute?: boolean;
  muteNote?: string;
  onNoteChange?: (note: string) => void;
}

export default function MuteDeleteModal(props: Props) {
  const { mute, onNoteChange, muteNote, comment, isOpen, onClose } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();

  const muteMutation = useMutation({
    mutationFn: (data: {
      key: string;
      options: {
        notes?: string;
        isKeychain?: boolean;
      };
    }) =>
      mutePost(
        loginInfo,
        data.key,
        true,
        {
          community: comment.category,
          account: comment.author,
          permlink: comment.permlink,
          notes: data.options.notes,
        },
        data.options.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(addCommentHandler({ ...comment, is_muted: 1 }));
      onClose();
      toast.success(`Muted`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      deleteComment(
        loginInfo,
        data.key,
        {
          author: comment.author,
          permlink: comment.permlink,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(addCommentHandler({ ...comment, link_id: undefined }));
      onClose();
      toast.success(`Deleted`);
    },
  });

  function handleAction() {
    authenticateUser();
    if (!isAuthorized()) return;
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    if (mute) {
      muteMutation.mutate({
        key: credentials.key,
        options: { notes: muteNote, isKeychain: credentials.keychainLogin },
      });
      return;
    }

    deleteMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  const isPending = deleteMutation.isPending || muteMutation.isPending;

  return (
    <Modal
      isDismissable={!isPending}
      hideCloseButton
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {mute ? "Mute" : "Delete"} post/comment
            </ModalHeader>
            <ModalBody className="flex flex-col gap-6">
              {
                <p>
                  {mute
                    ? "Please provide a note regarding your decision to mute this content."
                    : "Do you really want to delete this post/comment?"}
                </p>
              }

              {mute && (
                <Input
                  maxLength={120}
                  label="Notes"
                  isDisabled={isPending}
                  value={muteNote}
                  onValueChange={onNoteChange}
                />
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isPending}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleAction}
                isLoading={isPending}
                isDisabled={(mute && !muteNote) || isPending}
              >
                {mute ? "Mute" : " Delete"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
