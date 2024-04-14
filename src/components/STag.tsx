import { Link } from '@nextui-org/link';
import clsx from 'clsx';
import { validateCommunity } from '@/libs/utils/helper';

export default function STag({ className, content, tag }: { className?: string, content?: string, tag: string }) {
    return (<Link title={tag} className={clsx(className, 'text-default-900 ')} href={`/trending/${tag}`} >
        {content ?? tag}
    </Link >
    )
}
