import { Link } from '@nextui-org/react';
import STooltip from './STooltip';
import clsx from 'clsx';

export default function STag({ className, content, tag }: { className?: string, content?: string, tag: string }) {
    return (
        <div>
            <STooltip content={tag} >
                <Link className={clsx(className, 'text-default-900 ')} href={`/trending/${tag}`} >
                    {content ?? tag}
                </Link >

            </STooltip>
        </div>
    )
}
