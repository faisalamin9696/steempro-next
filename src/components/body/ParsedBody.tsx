import { Button, Link } from '@nextui-org/react';
import parse, { domToReact } from 'html-react-parser';
import React from 'react';
import CommentCover from '../comment/component/CommentCover';
import './style.scss';
// import { Image } from '@nextui-org/react'

export function ParsedBody({ body }: { body: string }): JSX.Element {

    const options = {
        replace(domNode) {
            if (domNode?.attribs && domNode?.name === 'img') {
                return <div className='img-container relative'>
                    <CommentCover
                        noCard {...domNode?.attribs} />

                    <Button size='sm'
                        className='open-button absolute top-0 right-0'>
                        Open
                    </Button>
                </div>

            }
            if (domNode?.attribs && domNode?.name === 'a') {
                return <Link
                    {...domNode?.attribs}>
                    {domToReact(domNode.children)}</Link>

            }

            if (domNode?.name === 'table') {

                // Render the table content using domToReact
                return <div className='markdown-body table-scrollable'>
                    <table className={`w-full text-sm text-left rtl:text-right shadow-md sm:rounded-lg`}>
                        {domToReact(domNode.children)}
                    </table>

                    <script>

                    </script>
                </div>;
            }

        }

    };

    const parsedBody = parse(body, options);

    return parsedBody as JSX.Element


}