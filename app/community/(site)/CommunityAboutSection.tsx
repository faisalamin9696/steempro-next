"use client";

import CommunityCard from "@/components/community/CommunityCard";
import { Accordion, AccordionItem } from "@heroui/react";

function CommunityAboutSection({
  community,
  account,
}: {
  community: Community;
  account: AccountExt;
}) {
  return (
    <Accordion
      isCompact
      variant="bordered"
      className="border-1 block lg:hidden"
      itemClasses={{
        title: "text-muted",
        indicator: "text-foreground text-muted",
      }}
    >
      <AccordionItem key="profile" aria-label="Profile details" title="About">
        <CommunityCard
          community={community}
          account={account}
          classNames={{
            base: "shadow-none! border-none! bg-transparent",
            body: "pt-0!",
          }}
        />
      </AccordionItem>
    </Accordion>
  );
}

export default CommunityAboutSection;
