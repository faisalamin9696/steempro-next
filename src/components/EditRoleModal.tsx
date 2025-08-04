import { useAppSelector } from "@/constants/AppFunctions";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import {
  setUserRole,
  setUserRoleTitle,
  setUserTitle,
} from "@/libs/steem/condenser";
import { Role } from "@/utils/community";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import SModal from "./ui/SModal";

interface Props {
  comment: Post | Feed;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleOnUpdate?: (role: RoleTypes, title: string) => void;
}
export default function EditRoleModal(props: Props) {
  const { comment, handleOnUpdate, onOpenChange, isOpen } = props;
  const { data: session } = useSession();
  let [title, setTitle] = useState(comment.author_title);
  let [role, setRole] = useState<RoleTypes>(comment.author_role || "guest");
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const observerRole = comment.observer_role;
  const dispatch = useDispatch();
  const { authenticateUser, isAuthorized } = useLogin();

  let items = Role.atLeast(observerRole, "owner")
    ? [
        { item: "Admin", value: "admin" },
        { item: "Moderator", value: "mod" },
        { item: "Member", value: "member" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : Role.atLeast(observerRole, "admin")
    ? [
        { item: "Moderator", value: "mod" },
        { item: "Member", value: "member" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : Role.atLeast(observerRole, "mod")
    ? [
        { item: "Member", value: "member" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : [];

  function handleSuccess() {
    dispatch(
      addCommentHandler({
        ...comment,
        author_role: role,
        author_title: title,
      })
    );
    handleOnUpdate && handleOnUpdate(role, title);
    toast.success("Updated");
    onOpenChange(false);
  }
  function handleFailed(error: any) {
    toast.error(error.message || JSON.stringify(error));
  }
  const roleTitleMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      setUserRoleTitle(
        loginInfo,
        data.key,
        {
          communityId: comment.category,
          account: comment.author,
          role: role || "guest",
          title: title,
        },
        data.isKeychain
      ),
    onSuccess() {
      handleSuccess();
    },
    onError(error) {
      handleFailed(error);
    },
  });

  const roleMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      setUserRole(
        loginInfo,
        data.key,
        {
          communityId: comment.category,
          account: comment.author,
          role: role || "guest",
        },
        data.isKeychain
      ),
    onSuccess() {
      handleSuccess();
    },
    onError(error) {
      handleFailed(error);
    },
  });

  const titleMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      setUserTitle(
        loginInfo,
        data.key,
        {
          communityId: comment.category,
          account: comment.author,
          title: title,
        },
        data.isKeychain
      ),
    onSuccess() {
      handleSuccess();
    },
  });

  function handleUpdate() {
    title = title?.trim();
    const isTitleChanged = title !== comment.author_title;
    const isRoleChanged = role !== (comment.author_role || "guest");

    if (isTitleChanged || isRoleChanged) {
      authenticateUser();

      if (!isAuthorized()) return;

      const credentials = getCredentials(getSessionKey(session?.user?.name));

      if (!credentials?.key) {
        toast.error("Invalid credentials");
        return;
      }

      // update both title and role
      if (isTitleChanged && isRoleChanged) {
        roleTitleMutation.mutate({
          key: credentials.key,
          isKeychain: credentials.keychainLogin,
        });
        return;
      }

      // update only title
      if (isTitleChanged && !isRoleChanged) {
        titleMutation.mutate({
          key: credentials.key,
          isKeychain: credentials.keychainLogin,
        });
        return;
      }

      // update only role
      if (isRoleChanged && !isTitleChanged) {
        roleMutation.mutate({
          key: credentials.key,
          isKeychain: credentials.keychainLogin,
        });
        return;
      }
    } else {
      toast.info("Nothing to update!");
    }
  }

  const handleRoleSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRole(e.target.value as any);
  };

  const isPending =
    roleMutation.isPending ||
    titleMutation.isPending ||
    roleTitleMutation.isPending;

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ hideCloseButton: true, isDismissable: !isPending }}
      title={() => "Update title, role"}
      body={() => (
        <div className="flex flex-col gap-4">
          <Input
            className="w-full"
            maxLength={32}
            label="Title"
            size="sm"
            classNames={{ base: "items-center" }}
            value={title}
            onValueChange={setTitle}
            isClearable
            isDisabled={isPending}
          />

          {!(
            Role.level(comment.observer_role) <= Role.level(comment.author_role)
          ) && (
            <Select
              size="sm"
              aria-label="Select role"
              items={items}
              label="Role"
              isDisabled={isPending}
              className="max-w-xs"
              defaultSelectedKeys={[role]}
              disabledKeys={[comment.author_role]}
              onChange={handleRoleSelectionChange}
              classNames={{ base: "items-center" }}
            >
              {(item) => <SelectItem key={item.value}>{item.item}</SelectItem>}
            </Select>
          )}
        </div>
      )}
      footer={(onClose) => (
        <>
          <Button
            color="danger"
            isDisabled={isPending}
            variant="light"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            isDisabled={isPending}
            isLoading={isPending}
            onPress={handleUpdate}
          >
            Update
          </Button>
        </>
      )}
    />
  );
}
