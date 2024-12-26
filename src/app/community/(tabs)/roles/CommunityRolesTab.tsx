"use client";

import React from "react";

import CommunityMembers from "@/components/community/CommunityMembers";

export function CommunityRolesTab({ community }: { community: Community }) {
  return (
    <div className="w-full flex flex-col gap-2 pb-10">
      <CommunityMembers large community={community} stickyHeader />
    </div>
  );
}
