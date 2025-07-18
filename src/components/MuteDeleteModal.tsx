"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { deleteComment, mutePost } from "@/libs/steem/condenser";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import SModal from "./ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: Post | Feed;
  mute?: boolean;
  muteNote?: string;
  onNoteChange?: (note: string) => void;
}

export default function MuteDeleteModal(props: Props) {
  const { mute, onNoteChange, muteNote, comment, isOpen, onOpenChange } = props;
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
      onOpenChange(false);
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
      onOpenChange(false);
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
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ hideCloseButton: true }}
      title={() => `${mute ? "Mute" : "Delete"} post/comment}`}
      subTitle={() =>
        `${
          mute
            ? "Please provide a note regarding your decision to mute this content."
            : "Do you really want to delete this post/comment?"
        }`
      }
      body={() => (
        <>
          {mute && (
            <Input
              maxLength={120}
              label="Note"
              isDisabled={isPending}
              value={muteNote}
              onValueChange={onNoteChange}
            />
          )}
        </>
      )}
      footer={(onClose) => (
        <>
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
        </>
      )}
    />
  );
}
