import { Card } from "@heroui/react";
import SAvatar from "../ui/SAvatar";
import { Users, ShieldCheck, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import SubscribeButton from "./SubscribeButton";

interface Props {
  community: Community;
  account?: string;
}

export default function CommunityItem({ community, account }: Props) {
  const { data: session } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(
    Boolean(community.observer_subscribed)
  );
  const isSelf = session?.user?.name === account;

  return (
    <Card className="post-card p-3 shadow-none border-1 border-divider hover:border-primary/50">
      <div className="flex flex-row items-start gap-3">
        <SAvatar size={48} username={community.account} radius="md" />

        <div className="flex flex-col flex-1 min-w-0">
          <Link
            href={`/trending/${community.account}`}
            className="hover:text-primary transition-colors"
          >
            <h3 className="font-bold text-sm sm:text-base truncate">
              {community.title}
            </h3>
          </Link>
          <p className="text-xs text-muted truncate opacity-80">
            {community.about ||
              community.description ||
              "No description available"}
          </p>

          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted">
              <Users size={14} className="opacity-60" />
              <span className="font-semibold">
                {community.count_subs.toLocaleString()}
              </span>
              <span className="opacity-70">Subscribers</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted">
              <DollarSign size={14} className="opacity-60" />
              <span className="font-semibold">
                {community.sum_pending.toLocaleString()}
              </span>
            </div>

            {community.observer_role && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-primary font-bold">
                <ShieldCheck size={14} />
                <span className="capitalize">{community.observer_role}</span>
              </div>
            )}
          </div>
        </div>

        {!isSelf ? (
          <SubscribeButton
            size="sm"
            variant={isSubscribed ? "bordered" : "flat"}
            color={isSubscribed ? "default" : "primary"}
            onSubscribe={setIsSubscribed}
            community={community}
          />
        ) : null}
      </div>
    </Card>
  );
}
