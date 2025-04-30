import React from "react";

import CommunityInfoCard from "@/components/CommunityInfoCard";

export function CommunityAboutTab({ community }: { community: Community }) {
  return <CommunityInfoCard onChatPress={() => {}} community={community} />;
}
