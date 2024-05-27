import { useAppSelector } from "@/libs/constants/AppFunctions";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";
import { setUserRole, setUserTitle } from "@/libs/steem/condenser";
import { Role } from "@/libs/utils/community";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useLogin } from "./AuthProvider";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { useSession } from "next-auth/react";

interface Props {
  comment: Post | Feed;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}
export default function EditRoleModal(props: Props) {
  const { comment } = props;
  const { isOpen, onOpenChange } = useDisclosure();
  const { data: session } = useSession();

  let [title, setTitle] = useState(comment.author_title);
  let [role, setRole] = useState<
    "muted" | "guest" | "member" | "mod" | "admin" | "owner" | ""
  >(comment.author_role || "guest");
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
    toast.success("Updated");
    props.onOpenChange && props.onOpenChange(false);
    onOpenChange();
  }
  function handleFailed(error: any) {
    toast.error("Failed: " + String(error));
  }
  const roleTitleMutation = useMutation({
    mutationFn: (key: string) =>
      Promise.all([
        setUserRole(loginInfo, key, {
          communityId: comment.category,
          account: comment.author,
          role: role || "guest",
        }),
        setUserTitle(loginInfo, key, {
          communityId: comment.category,
          account: comment.author,
          title: title,
        }),
      ]),
    onSuccess() {
      handleSuccess();
    },
    onError(error) {
      handleFailed(error);
    },
  });

  const roleMutation = useMutation({
    mutationFn: (key: string) =>
      setUserRole(loginInfo, key, {
        communityId: comment.category,
        account: comment.author,
        role: role || "guest",
      }),
    onSuccess() {
      handleSuccess();
    },
    onError(error) {
      handleFailed(error);
    },
  });

  const titleMutation = useMutation({
    mutationFn: (key: string) =>
      setUserTitle(loginInfo, key, {
        communityId: comment.category,
        account: comment.author,
        title: title,
      }),
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
        roleTitleMutation.mutate(credentials.key);
        return;
      }

      // update only title
      if (isTitleChanged && !isRoleChanged) {
        titleMutation.mutate(credentials.key);
        return;
      }

      // update only role
      if (isRoleChanged && !isTitleChanged) {
        roleMutation.mutate(credentials.key);
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
    <Modal
      isOpen={props.isOpen ?? isOpen}
      hideCloseButton
      isDismissable={!isPending}
      onOpenChange={props.onOpenChange ?? onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Title, Role
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  className="w-full"
                  maxLength={32}
                  label="Title"
                  size="sm"
                  classNames={{ base: "items-center" }}
                  value={title}
                  onValueChange={setTitle}
                />

                {!(
                  Role.level(comment.observer_role) <=
                  Role.level(comment.author_role)
                ) && (
                  <Select
                    size="sm"
                    aria-label="Select role"
                    items={items}
                    label="Role"
                    className="max-w-xs"
                    defaultSelectedKeys={[role]}
                    disabledKeys={[comment.author_role]}
                    onChange={handleRoleSelectionChange}
                    classNames={{ base: "items-center" }}
                  >
                    {(item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.item}
                      </SelectItem>
                    )}
                  </Select>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={isPending}
                variant="light"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                color="primary"
                isDisabled={isPending}
                isLoading={isPending}
                onClick={handleUpdate}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
