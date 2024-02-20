import { As, Badge } from "@nextui-org/react";
import { Avatar as NextAvatar } from "@nextui-org/react";
import clsx from "clsx";
import STooltip from "./STooltip";
import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";

interface Props {
    username: string,
    quality?: 'small' | 'large' | 'medium',
    onClick?: () => void;
    badge?: string | number;
    border?: boolean;
    className?: string;
    size?: 'sm' | 'lg' | 'xl';
}
export default function SAvatar(props: Props) {
    const { username, size, quality, onClick, badge, border, className } = props;
    const imageSize = size === 'xl' ? 160 : size === 'lg' ? 100 : 50;
    return (<STooltip content={badge ? `${'Reputation score'}: ${badge}` : username}>
        <Badge content={typeof (badge) === 'number' ? badge.toFixed(0) : badge}
            className={clsx(badge ? '' : 'hidden')} color='primary' shape="circle">
            <Image
                alt=""
                height={imageSize}
                width={imageSize}
                onClick={onClick}
                src={`${getResizedAvatar(username, quality ?? 'small')}`}
                className={clsx(' shadow-lg rounded-full', border && 'border', className)}
            />
        </Badge>
    </STooltip >
    )
}
