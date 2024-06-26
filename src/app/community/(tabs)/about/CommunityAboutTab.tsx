import React from "react";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdDescription } from "react-icons/md";
import { PiUserListBold } from "react-icons/pi";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import { mapSds } from "@/libs/constants/AppFunctions";
import CommunityRoles from "@/components/community/CommunityRoles";

export function CommunityAboutTab({ community }: { community: Community }) {
    return <div className='w-full flex flex-col gap-2'>
        <Accordion selectionMode='multiple' variant="splitted"
            defaultExpandedKeys={["description", 'rules']}>
            <AccordionItem key="description" aria-label="Description"

                startContent={<MdDescription className="text-primary text-xl" />}
                title="Description">
                <MarkdownViewer className='!max-w-none' text={community.description} />
            </AccordionItem>
            <AccordionItem key="rules" aria-label="Rules" title="Rules"
                startContent={<FaClipboardQuestion className="text-primary text-xl" />}>
                <MarkdownViewer className='!max-w-none' text={`- ${community.flag_text.replace('\n\n', '\n').replaceAll('\n', '\n - ')}`} />
            </AccordionItem>

            <AccordionItem key="members" aria-label="Members" title="Members"
                startContent={<PiUserListBold className="text-primary text-xl" />}>
                <CommunityRoles roles={mapSds(community.roles)} stickyHeader />
            </AccordionItem>
        </Accordion>
    </div>
}