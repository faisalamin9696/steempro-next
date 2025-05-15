import React from "react";

import CommunityInfoCard from "@/components/CommunityInfoCard";

interface Props {
  community: Community;
  onLeadershipPress: () => void;
}
export function CommunityAboutTab(props: Props) {
  const { community, onLeadershipPress } = props;
  return (
    <CommunityInfoCard
      onChatPress={() => {}}
      community={community}
      onLeadershipPress={onLeadershipPress}
    />
  );
}
