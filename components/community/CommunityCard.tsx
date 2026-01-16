"use client";

import BackgroundImage from "../BackgroundImage";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import { Card, CardBody, CardProps } from "@heroui/card";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";
import moment from "moment";
import Link from "next/link";
import { getResizedAvatar } from "@/utils/image";
import { Calendar, DollarSign } from "lucide-react";
import { Constants } from "@/constants";
import { twMerge } from "tailwind-merge";
import { mapSds } from "@/constants/functions";
import MarkdownViewer from "../post/body/MarkdownViewer";
import { Role as RoleLevel } from "@/utils/community";
import UsersModal from "../ui/UsersModal";
import { useState } from "react";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { Badge, Chip } from "@heroui/react";

const ICON_SIZE = 20;

interface Props extends CardProps {
  community: Community;
  headerClass?: string;
  account: AccountExt;
}
function CommunityCard({ community, account, headerClass, ...props }: Props) {
  const { data: session } = useSession();
  const { account: name, title, about, rank, created } = community || {};
  const isMe = session?.user?.name === name;
  const displayName = (title || name).replace("@", "");
  const shareUrl = `${Constants.site_url}/trending/${name}`;
  const roles: Role[] = mapSds(community.roles);
  const leaderShip = roles.filter((item) =>
    RoleLevel.atLeast(item.role, "mod")
  );
  const { profile = {} } = JSON.parse(account.posting_json_metadata || "{}");
  const { cover_image = "" }: PostingJsonMetadata = profile;
  const [showUsersModal, setShowUsersModal] = useState<{
    isOpen: boolean;
    isLeaders?: boolean;
  }>({ isOpen: false, isLeaders: false });

  return (
    <Card className="flex flex-col gap-2 " {...props}>
      {/* Cover image */}

      <div className={twMerge("hidden lg:block", headerClass)}>
        <BackgroundImage
          fetchPriority="high"
          className="border-x-2 border-t-2 border-card rounded-t-xl"
          src={proxifyImageUrl(cover_image)}
          height={100}
          width="100%"
          overlay={!cover_image}
          overlayClass="bg-foreground/10"
        />
      </div>

      <CardBody className="flex flex-col gap-4 py-1 pb-4">
        {/* About */}
        {about && (
          <MarkdownViewer body={about} className="prose-sm! font-semibold" />
        )}

        <ItemRow icon={<Calendar size={ICON_SIZE} />}>
          <p className="text-sm">
            <span className="text-muted">Created</span>{" "}
            {moment.unix(created).format("MMM DD, YYYY")}
          </p>
        </ItemRow>

        <ItemRow icon={<DollarSign size={ICON_SIZE} />}>
          <p className="text-sm">
            <span className="text-muted">Pending Reward</span>{" "}
            {community.sum_pending?.toLocaleString()}
          </p>
        </ItemRow>

        <Divider />

        {/* Stats Grid */}
        <StatsGrid
          items={[
            { label: "Rank", value: community.rank },
            {
              label: "Members",
              value: community.count_subs,
              onClick: () => {
                setShowUsersModal({ isOpen: true, isLeaders: false });
              },
              className: "cursor-pointer hover:underline",
            },
            {
              label: (
                <span className="flex flex-row gap-1 items-center">
                  <span className="h-2 w-2 bg-success rounded-full" /> Active
                </span>
              ),
              value: community.count_authors,
            },
          ]}
        />

        {/* Leadership */}
        {leaderShip?.length && (
          <Section title="Leadership">
            <AvatarGroup
              isBordered
              radius="md"
              max={5}
              renderCount={(count) => (
                <p
                  onClick={() =>
                    setShowUsersModal({ isOpen: true, isLeaders: true })
                  }
                  className="text-small ms-2 font-medium hover:underline cursor-pointer"
                >
                  +{count} more
                </p>
              )}
            >
              {leaderShip.map((w) => (
                <Link key={w.account} href={`/@${w.account}`}>
                  <Avatar src={getResizedAvatar(w.account)} />
                </Link>
              ))}
            </AvatarGroup>
          </Section>
        )}

        <Section title="Rules">
          <MarkdownViewer
            className=" prose-li:mt-0! max-h-40 prose-sm!"
            body={`- ${community.flag_text
              .replace("\n\n", "\n")
              .replaceAll("\n", "\n - ")}`}
          />
        </Section>
      </CardBody>

      {showUsersModal.isOpen && (
        <UsersModal
          data={showUsersModal?.isLeaders ? leaderShip : []}
          columns={[
            {
              key: "account",
              searchable: true,
              header: "User",
              render: (acc) => (
                <div className="flex flex-row gap-2 items-center">
                  <SAvatar size="sm" username={acc} />
                  <SUsername username={acc} />
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (role) => (
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    role === "mod"
                      ? "success"
                      : role === "admin"
                      ? "warning"
                      : "default"
                  }
                >
                  {role}
                </Chip>
              ),
            },
          ]}
          isOpen={showUsersModal.isOpen}
          onOpenChange={(isOpen) => setShowUsersModal({ isOpen })}
          fetchType={showUsersModal?.isLeaders ? undefined : "subscribers"}
          username={community.account}
          title={showUsersModal?.isLeaders ? "Leaders" : "Members"}
        />
      )}
    </Card>
  );
}

/* ---------------- Reusable small components ---------------- */

const ItemRow = ({
  icon,
  children,
  className,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={twMerge("flex flex-row items-center gap-2", className)}>
    {icon}
    {children}
  </div>
);

const StatsGrid = ({ items }) => (
  <div className="grid grid-cols-3 gap-2 w-full">
    {items.map(({ label, value, onClick, className }) => (
      <div key={label} className="flex flex-col items-start">
        <p className="font-semibold text-base">{value}</p>
        <p
          onClick={onClick}
          className={twMerge("text-xs text-muted", className)}
        >
          {label}
        </p>
      </div>
    ))}
  </div>
);

const Section = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <p className="text-base font-semibold">{title}</p>
    <div className="flex flex-row items-center gap-4 px-3">{children}</div>
  </div>
);

export default CommunityCard;
