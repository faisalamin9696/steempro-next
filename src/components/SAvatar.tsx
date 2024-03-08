import { As, Badge } from "@nextui-org/react";
import { Avatar as NextAvatar } from "@nextui-org/react";
import clsx from "clsx";
import STooltip from "./STooltip";
import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";

interface Props {
    username: string,
    quality?: 'small' | 'large' | 'medium',
    onClick?: (event) => void;
    border?: boolean;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export default function SAvatar(props: Props) {
    const { username, size, quality, onClick, border, className } = props;
    const imageSize = size === 'xl' ? 160 :
        size === 'lg' ? 100 :
            size === 'md' ? 70 :
                size === 'sm' ? 50 :
                    size === 'xs' ? 25 : 60;


    if (!username) return <></>
    return (<div>
        <Image
            title={username}
            onError={(e) => {
                e.currentTarget.src = '/image-placeholder.png'

            }}
            alt=""
            height={imageSize}
            width={imageSize}
            onClick={onClick}
            src={`${getResizedAvatar(username, quality ?? 'small')}`}
            className={clsx(' shadow-lg rounded-full', border && 'border', className)}
        />
    </div>
    )
}
