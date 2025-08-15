import { useAppSelector } from "@/constants/AppFunctions";
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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import { validate_account_name } from "@/utils/chainValidation";
import { getResizedAvatar } from "@/utils/parseImage";
import { Avatar } from "@heroui/avatar";
import SModal from "./ui/SModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  community: Community;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
export default function AddRoleModal(props: Props) {
  let { community, isOpen, onOpenChange } = props;
  const { data: session } = useSession();
  const { t } = useLanguage();
  let [username, setUsername] = useState("");
  let [avatar, setAvatar] = useState("");

  let [title, setTitle] = useState("");
  let [role, setRole] = useState<
    "muted" | "guest" | "member" | "mod" | "admin" | "owner" | ""
  >("guest");
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const { authenticateUser, isAuthorized } = useLogin();

  let items = Role.atLeast(community.observer_role, "owner")
    ? [
        { item: "Admin", value: "admin" },
        { item: "Moderator", value: "mod" },
        { item: "Member", value: "member" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : Role.atLeast(community.observer_role, "admin")
    ? [
        { item: "Moderator", value: "mod" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : Role.atLeast(community.observer_role, "mod")
    ? [
        { item: "Member", value: "member" },
        { item: "Guest", value: "guest" },
        { item: "Muted", value: "muted" },
      ]
    : [];

  useEffect(() => {
    const timeOut = setTimeout(() => {
      username = username.trim().toLowerCase();
      setAvatar(username);
    }, 1000);
    return () => clearTimeout(timeOut);
  }, [username]);

  function handleSuccess() {
    toast.success(t('community.role.updated'));
    onOpenChange(false);
  }
  function handleFailed(error: any) {
    toast.error(error.message || JSON.stringify(error));
  }
  const roleTitleMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) => {
      if (data.isKeychain) {
        return setUserRoleTitle(
          loginInfo,
          data.key,
          {
            communityId: community.account,
            account: username,
            title: title,
            role: role || "guest",
          },
          data.isKeychain
        );
      } else
        return Promise.all([
          setUserRole(
            loginInfo,
            data.key,
            {
              communityId: community.account,
              account: username,
              role: role || "guest",
            },
            data.isKeychain
          ),
          setUserTitle(
            loginInfo,
            data.key,
            {
              communityId: community.account,
              account: username,
              title: title,
            },
            data.isKeychain
          ),
        ]);
    },
    onSuccess() {
      handleSuccess();
    },
    onError(error) {
      handleFailed(error);
    },
  });

  const roleMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      setUserRole(loginInfo, data.key, {
        communityId: community.account,
        account: username,
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
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      setUserTitle(
        loginInfo,
        data.key,
        {
          communityId: community.account,
          account: username,
          title: title,
        },
        data.isKeychain
      ),
    onSuccess() {
      handleSuccess();
    },
  });

  async function handleUpdate() {
    username = username?.replaceAll("@", "").toLowerCase().trim();

    if (validate_account_name(username)) {
      toast.info(t('community.role.invalid_username'));
      return;
    }

    title = title?.trim();
    const isTitleChanged = title !== "";
    const isRoleChanged = role !== "guest";

    if (isTitleChanged || isRoleChanged) {
      authenticateUser();

      if (!isAuthorized()) return;

      const credentials = getCredentials(getSessionKey(session?.user?.name));

      if (!credentials?.key) {
        toast.error(t('community.role.invalid_credentials'));
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
      toast.info(t('community.role.nothing_to_update'));
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
      title={() => t('community.role.set_role_title')}
      modalProps={{ hideCloseButton: true, isDismissable: !isPending }}
      body={() => (
        <div className="flex flex-col gap-4">
          <Input
            className="w-full"
            maxLength={32}
            label="Username"
            size="sm"
            classNames={{ base: "items-center" }}
            value={username}
            onValueChange={setUsername}
            endContent={<Avatar src={getResizedAvatar(avatar)} size="sm" />}
          />

          <Input
            className="w-full"
            maxLength={32}
            label="Title"
            size="sm"
            classNames={{ base: "items-center" }}
            value={title}
            onValueChange={setTitle}
          />

          <Select
            size="sm"
            aria-label="Select role"
            items={items}
            label="Role"
            className="max-w-xs"
            defaultSelectedKeys={[role]}
            onChange={handleRoleSelectionChange}
            classNames={{ base: "items-center" }}
          >
            {(item) => <SelectItem key={item.value}>{item.item}</SelectItem>}
          </Select>
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
            {t('community.role.close')}
          </Button>
          <Button
            color="primary"
            isDisabled={isPending}
            isLoading={isPending}
            onPress={handleUpdate}
          >
            {t('community.role.update')}
          </Button>
        </>
      )}
    />
  );
}
