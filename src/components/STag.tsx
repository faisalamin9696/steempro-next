import { Link } from '@nextui-org/link';
import STooltip from './STooltip';
import clsx from 'clsx';
import { validateCommunity } from '@/libs/utils/helper';

export default function STag({ className, content, tag }: { className?: string, content?: string, tag: string }) {
    return (
        <div>
            <STooltip content={tag} >
                <Link className={clsx(className, 'text-default-900 ')} href={`/${validateCommunity(tag) ? 'important' : 'trending'}/${tag}`} >
                    {content ?? tag}
                </Link >

            </STooltip>
        </div>
    )
}
