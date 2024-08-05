import React from "react";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdDescription } from "react-icons/md";
import { PiUserListBold } from "react-icons/pi";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommunityMembers from "@/components/community/CommunityMembers";
import { CommunityActivities } from "@/components/community/CommunityActivities";
import { RxActivityLog } from "react-icons/rx";

export function CommunityAboutTab({ community }: { community: Community }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <Accordion
        isCompact
        selectionMode="multiple"
        variant="splitted"
        defaultExpandedKeys={["description", "rules"]}
      >
        <AccordionItem
          key="members"
          aria-label="Members"
          title="Members"
          startContent={<PiUserListBold className="text-primary text-xl" />}
        >
          <CommunityMembers large community={community} stickyHeader />
        </AccordionItem>

        <AccordionItem
          key="activities"
          aria-label="Activities"
          title="Activities"
          startContent={<RxActivityLog className="text-primary text-xl" />}
        >
          <CommunityActivities community={community} />
        </AccordionItem>
      </Accordion>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-0">
        <Accordion
          isCompact
          variant="splitted"
          defaultExpandedKeys={["description"]}
        >
          <AccordionItem
            key="description"
            aria-label="Description"
            startContent={<MdDescription className="text-primary text-xl" />}
            title="Description"
          >
            <MarkdownViewer
              className="!max-w-none !text-sm !text-justify"
              text={community.description}
            />
          </AccordionItem>
        </Accordion>

        <Accordion
          isCompact
          selectionMode="multiple"
          variant="splitted"
          defaultExpandedKeys={["rules"]}
        >
          <AccordionItem
            key="rules"
            aria-label="Rules"
            title="Rules"
            startContent={
              <FaClipboardQuestion className="text-primary text-xl" />
            }
          >
            <MarkdownViewer
              className="!max-w-none !text-sm !text-justify"
              text={`- ${community.flag_text
                .replace("\n\n", "\n")
                .replaceAll("\n", "\n - ")}`}
            />
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
