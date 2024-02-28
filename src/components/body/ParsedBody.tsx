import { Button, Link } from '@nextui-org/react';
import parse, { domToReact } from 'html-react-parser';
import React from 'react';
import CommentCover from '../comment/component/CommentCover';
import './style.scss';
import { MdOpenInNew } from "react-icons/md";
import { proxifyImageUrl } from '@/libs/utils/ProxifyUrl';
import { getProxyImageURL } from '@/libs/utils/image';

export function ParsedBody({ body }: { body: string }): JSX.Element {


    function handleOpenImage(url?: string) {
        if (url && window)
            window.open(getProxyImageURL(proxifyImageUrl(url, false), 'large'), '_blank')?.focus()
    }
    const options = {
        replace(domNode) {
            if (domNode?.attribs && domNode?.name === 'img') {
                return <div className='img-container relative'>
                    <CommentCover
                        src={domNode?.attribs?.src}
                        alt={domNode?.attribs?.alt}
                        noCard />

                    <Button size='sm'
                        isIconOnly
                        title='Open image'
                        variant='flat'
                        onPress={() => handleOpenImage(domNode?.attribs?.src)}
                        radius='full'
                        className='open-button absolute top-0 right-0'>
                        <MdOpenInNew className='text-xl' />
                    </Button>
                </div>

            }
            if (domNode?.attribs && domNode?.name === 'a') {
                return <Link
                    {...domNode?.attribs}

                >
                    {domToReact(domNode.children)}</Link>

            }

            if (domNode?.name === 'table') {

                // Render the table content using domToReact
                return <div className='markdown-body table-scrollable'>
                    <table className={`w-full text-sm text-left rtl:text-right shadow-md sm:rounded-lg`}>
                        {domToReact(domNode.children)}
                    </table>


                </div>;
            }

        }

    };

    const parsedBody = parse(body, options);

    return parsedBody as JSX.Element


}