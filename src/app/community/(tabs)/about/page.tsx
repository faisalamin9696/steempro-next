"use client"

import MarkdownViewer from '@/components/body/MarkdownViewer';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { Accordion, AccordionItem } from '@nextui-org/react';
import React from 'react'
import { MdDescription } from "react-icons/md";
import { FaClipboardQuestion } from "react-icons/fa6";
import CommunityEnd from '../../(site)/@end/page';
import { PiUserListBold } from "react-icons/pi";
import CommunityRoles from '../../_components/CommunityRoles';

interface Props {
    data: Community;
}

export default function CommunityAboutTab(props: Props) {
    const { data } = props;

    const { community } = usePathnameClient();

    return (
        <div className='w-full flex flex-col gap-2'>

            <Accordion selectionMode='multiple' variant="splitted"
                defaultExpandedKeys={["description"]}>
                <AccordionItem key="description" aria-label="Description"

                    startContent={<MdDescription className="text-primary text-xl" />}
                    title="Description">
                    <MarkdownViewer className='!max-w-none' text={data.description} />
                </AccordionItem>
                <AccordionItem key="rules" aria-label="Rules" title="Rules"
                    startContent={<FaClipboardQuestion className="text-primary text-xl" />}>
                    <MarkdownViewer className='!max-w-none' text={`- ${data.flag_text.replace('\n\n', '\n').replaceAll('\n', '\n - ')}`} />
                </AccordionItem>

                <AccordionItem key="members" aria-label="Members" title="Members"
                    startContent={<PiUserListBold className="text-primary text-xl" />}>
                    <CommunityRoles />
                </AccordionItem>
            </Accordion>





        </div>
    )
}
