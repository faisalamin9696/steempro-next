import clsx from "clsx";
import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";
import Link from "next/link";

interface Props {
    username: string,
    quality?: 'small' | 'large' | 'medium',
    onClick?: (event) => void;
    border?: boolean;
    className?: string;
    size?: 'xs' | '1xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export default function SAvatar(props: Props) {
    const { username, size, quality, onClick, border, className } = props;
    const imageSize = size === 'xl' ? 160 :
        size === 'lg' ? 100 :
            size === 'md' ? 70 :
                size === 'sm' ? 45 :
                    size === '1xs' ? 35 :
                        size === 'xs' ? 25 : 60;


    if (!username) return null

    return (<Link href={`/@${username}`} onClick={onClick}>
        <Image
            title={username}
            onError={(e) => {
                e.currentTarget.src = '/image-placeholder.png'

            }}
            alt=""
            height={imageSize}
            width={imageSize}
            src={`${getResizedAvatar(username, quality ?? 'small')}`}
            className={clsx('max-w-none shadow-lg rounded-full', border && 'border', className)}
        />
    </Link>
    )
}
