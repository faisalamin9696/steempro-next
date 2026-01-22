"use client";

import BackgroundImage from "../BackgroundImage";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import { Card, CardBody, CardProps } from "@heroui/card";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";
import moment from "moment";
import Link from "next/link";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { getResizedAvatar } from "@/utils/image";
import { Calendar, Globe, Heart, HeartHandshake, MapPin } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import UsersModal from "../ui/UsersModal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { calculateVoteValue } from "@/utils/helper";
import { Constants } from "@/constants";
import MarkdownViewer from "../post/body/MarkdownViewer";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import FollowButton from "./FollowButton";
import ChatButton from "../chat/ChatButton";
import EditButton from "../ui/EditButton";
import ShareButton from "../ui/ShareButton";

const ICON_SIZE = 20;

interface Props extends CardProps {
  account: AccountExt;
  headerClass?: string;
}

function ProfileCard({ account, headerClass, ...props }: Props) {
  const { data: session } = useSession();
  const { globalProps } = useSteemUtils();
  const isMe = session?.user?.name === account.name;
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const otherProfileData =
    useAppSelector((s) => s.profileReducer.values[account.name]) ?? account;
  const profileData = isMe ? loginData : otherProfileData;
  const { name, posting_json_metadata, created } = profileData || {};
  const shareUrl = `${Constants.site_url}/@${name}`;
  const { profile = {} } = JSON.parse(posting_json_metadata || "{}");
  const [showUsersModal, setShowUsersModal] = useState<{
    isOpen: boolean;
    fetchType?: "followers" | "following";
  }>({ isOpen: false });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isMe) {
      dispatch(addLoginHandler(account));
    }
  }, [isMe, account, dispatch]);

  const {
    name: fullName = "",
    about = "",
    location = "",
    website = "",
    cover_image = "",
  }: PostingJsonMetadata = profile;

  const displayName = (fullName || name).replace("@", "");

  return (
    <Card className="flex flex-col gap-2 " {...props}>
      <div className={twMerge("hidden lg:block", headerClass)}>
        <BackgroundImage
          fetchPriority="high"
          className="border-x-2 border-t-2 border-transparent rounded-t-2xl"
          src={proxifyImageUrl(cover_image)}
          height={100}
          width="100%"
          overlay={!cover_image}
          overlayClass="bg-foreground/10"
        />
      </div>

      <CardBody className="flex flex-col gap-4">
        <div className="hidden lg:flex flex-row w-full flex-wrap justify-start gap-2">
          {!isMe && (
            <>
              <FollowButton size={"sm"} radius="md" account={profileData} />

              <ChatButton size={"sm"} />
            </>
          )}

          {isMe && (
            <EditButton
              size={"sm"}
              variant="flat"
              color="primary"
              title={"Edit Profile"}
            />
          )}

          <ShareButton
            url={shareUrl}
            size={"sm"}
            variant="flat"
            title={displayName}
          />
        </div>

        {/* About */}
        {about && (
          <MarkdownViewer body={about} className="prose-sm! font-semibold" />
        )}

        <ItemRow icon={<Calendar className="text-muted" size={ICON_SIZE} />}>
          <p className="text-sm" title={moment.unix(created).toLocaleString()}>
            <span className="text-muted">Joined</span>{" "}
            {moment.unix(created).format("MMM DD, YYYY")}
          </p>
        </ItemRow>

        {/* Website */}
        {website && (
          <ItemRow icon={<Globe className="text-muted" size={ICON_SIZE} />}>
            <Link
              href={website}
              target="_blank"
              className="text-sm hover:text-blue-500"
            >
              {website}
            </Link>
          </ItemRow>
        )}

        {/* Location */}
        {location && (
          <ItemRow icon={<MapPin className="text-muted" size={ICON_SIZE} />}>
            <p className="text-sm">{location}</p>
          </ItemRow>
        )}

        {/* Followers + Following */}
        <div className="flex flex-wrap gap-6 text-sm">
          <FollowStat
            label="Followers"
            value={profileData.count_followers}
            onPress={() =>
              setShowUsersModal({ isOpen: true, fetchType: "followers" })
            }
          />
          <FollowStat
            label="Following"
            value={profileData.count_following}
            isFollowing
            onPress={() =>
              setShowUsersModal({ isOpen: true, fetchType: "following" })
            }
          />
        </div>

        <Divider />

        {/* Stats Grid */}
        <StatsGrid
          items={[
            { label: "Posts", value: profileData.count_root_posts },
            { label: "Comments", value: profileData.count_comments },
            {
              label: "Active",
              value: moment.unix(profileData.last_action).fromNow(true),
              title: moment.unix(profileData.last_action).toLocaleString(),
            },
          ]}
        />

        <StatsGrid
          items={[
            {
              label: "VP",
              value: `${profileData.upvote_mana_percent}%`,
              title: "Voting Power",
            },
            {
              label: "RC",
              value: `${profileData.rc_mana_percent}%`,
              title: "Resource Credits",
            },
            {
              label: "Vote",
              value: `$${calculateVoteValue(
                profileData,
                100,
                globalProps.fund_per_rshare,
                globalProps.median_price,
                false
              ).toLocaleString()}`,
              title: "Vote Value",
            },
          ]}
        />

        {/* Proxy */}
        {profileData.proxy && (
          <Section title="Witness Proxy">
            <ItemRow>
              <SAvatar size="sm" username={profileData.proxy} isBordered />
              <SUsername username={`@${profileData.proxy}`} />
            </ItemRow>
          </Section>
        )}

        {/* Witness Votes */}
        {!!profileData.witness_votes?.length && (
          <Section title="Witness Votes">
            <AvatarGroup
              isBordered
              radius="md"
              max={5}
              renderCount={(count) => (
                <p
                  onClick={() => setShowUsersModal({ isOpen: true })}
                  className="text-small ms-2 font-medium hover:underline cursor-pointer"
                >
                  +{count} more
                </p>
              )}
            >
              {(profileData.proxy
                ? [profileData.proxy]
                : profileData.witness_votes
              ).map((w) => (
                <Link key={w} href={`/@${w}`}>
                  <Avatar src={getResizedAvatar(w)} />
                </Link>
              ))}
            </AvatarGroup>
          </Section>
        )}
      </CardBody>

      {showUsersModal.isOpen && (
        <UsersModal
          data={showUsersModal.fetchType ? [] : profileData.witness_votes}
          isOpen={showUsersModal.isOpen}
          onOpenChange={(isOpen) => setShowUsersModal({ isOpen })}
          fetchType={showUsersModal.fetchType}
          username={profileData.name}
          title={
            showUsersModal.fetchType === "followers"
              ? "Followers"
              : showUsersModal.fetchType === "following"
                ? "Following"
                : "Witness Votes"
          }
        />
      )}
    </Card>
  );
}

/* ---------------- Reusable small components ---------------- */

const ItemRow = ({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex flex-row items-center gap-2">
    {icon}
    {children}
  </div>
);

const FollowStat = ({
  label,
  value,
  isFollowing,
  onPress,
}: {
  label: string;
  value: string | number;
  isFollowing?: boolean;
  onPress: () => void;
}) => (
  <div
    onClick={onPress}
    className="flex flex-row items-center gap-2 cursor-pointer hover:underline"
  >
    {isFollowing ? (
      <HeartHandshake className="text-muted" size={ICON_SIZE} />
    ) : (
      <Heart className="text-muted" size={ICON_SIZE} />
    )}
    <span className="flex flex-row gap-1">
      <p className="text-muted">{label}</p>
      <p>{value.toLocaleString()}</p>
    </span>
  </div>
);

const StatsGrid = ({ items }) => (
  <div className="grid grid-cols-3 gap-2 w-full">
    {items.map(({ label, value, title }) => (
      <div key={label} className="flex flex-col items-start" title={title}>
        <p className="font-semibold text-base">{value}</p>
        <p className="text-xs text-muted">{label}</p>
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

export default ProfileCard;
