import React, { useState } from "react";
import { User } from "@heroui/user";
import { getResizedAvatar } from "@/libs/utils/image";
import clsx from "clsx";
import { empty_comment } from "@/libs/constants/Placeholders";
import { Button } from "@heroui/button";
import { FaPencil } from "react-icons/fa6";
import EditRoleModal from "../../EditRoleModal";
import { Role as RoleCheck } from "@/libs/utils/community";
import SLink from "@/components/SLink";

interface Props {
  item: Role;
  community?: Community;
}

export const CommunitySubscriberItem = (props: Props) => {
  const { item, community } = props;
  const [roleTitle, setRoleTitle] = useState({
    role: item.role,
    title: item.title,
  });

  const [editRoleModal, setEditRoleModal] = useState<{
    isOpen: boolean;
    comment?: Post;
  }>({
    isOpen: false,
    comment: undefined,
  });
  return (
    <div
      className="relative flex flex-row items-center card-content border-none 
            bg-transparent gap-4 p-2 w-full justify-between"
    >
      <User
        classNames={{
          description: "mt-1 text-default-900/60 dark:text-gray-200 text-sm",
          name: "text-default-800",
        }}
        name={
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2 items-center">
              <SLink
                className="hover:text-blue-500"
                href={`/@${item.account}/posts`}
              >
                {item.account}
              </SLink>

              <p
                className={clsx(
                  roleTitle.role === "owner"
                    ? "text-green-500"
                    : roleTitle.role === "admin"
                    ? "text-blue-400"
                    : roleTitle.role === "mod"
                    ? "text-yellow-500"
                    : roleTitle.role === "muted"
                    ? "text-red-400"
                    : ""
                )}
              >
                {roleTitle.role}
              </p>
            </div>
          </div>
        }
        description={
          <div className="flex flex-col items-center">
            <p className="dark:bg-default-900/30 text-xs px-1 rounded-lg">
              {roleTitle.title}
            </p>
          </div>
        }
        avatarProps={
          {
            className: " cursor-pointer",
            src: getResizedAvatar(item.account),
            as: SLink,
            href: `/@${item.account}/posts`,
          } as any
        }
      />
      {RoleCheck.atLeast(community?.observer_role, "mod") && (
        <Button
          title="Edit role, title"
          size="sm"
          variant="flat"
          color="secondary"
          isIconOnly
          onPress={() => {
            setEditRoleModal({
              isOpen: !editRoleModal.isOpen,
              comment: {
                ...empty_comment(item.account, ""),
                observer_role: community?.observer_role ?? "guest",
                observer_title: community?.observer_title ?? "",
                category: community?.account ?? "",
                author_role: roleTitle.role,
                author_title: roleTitle.title,
              },
            });
          }}
        >
          <FaPencil className="text-sm" />
        </Button>
      )}

      {editRoleModal.isOpen && editRoleModal.comment && (
        <EditRoleModal
          comment={editRoleModal.comment}
          isOpen={editRoleModal.isOpen}
          handleOnUpdate={(role, title) =>
            setRoleTitle({ role: role, title: title })
          }
          onOpenChange={(isOpen) =>
            setEditRoleModal({ ...editRoleModal, isOpen: isOpen })
          }
        />
      )}
    </div>
  );
};

export default CommunitySubscriberItem;
