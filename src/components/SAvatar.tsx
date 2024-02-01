import { As, Badge, Image } from "@nextui-org/react";
import { Avatar as NextAvatar } from "@nextui-org/react";
import clsx from "clsx";
import STooltip from "./STooltip";
import { getResizedAvatar } from "@/libs/utils/image";

interface Props {
    username: string,
    quality?: 'small' | 'large' | 'medium',
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    sizeNumber?: number;
    xl?: boolean;
    as?: As<any>;
    badge?: string | number;
    isBordered?: boolean;
}
export default function SAvatar(props: Props) {
    const { username, quality,
        size, as, onClick, sizeNumber, xl, badge, isBordered } = props;

    return (<STooltip content={badge ? `${'Reputation score'}: ${badge}` : username}>
        <Badge content={typeof (badge) === 'number' ? badge.toFixed(0) : badge}
            className={clsx(badge ? '' : 'hidden')} color='primary' shape="circle">
            <NextAvatar
                isBordered={isBordered ?? false}
                as={as}
                size={sizeNumber ? undefined : size ?? 'sm'}
                className={` transition-transform ${xl ? ' h-24 w-24' : ''}`}
                color="default"
                name={username}
                onClick={onClick}
                src={`${getResizedAvatar(username, quality ?? 'small')}`}
            />
        </Badge>
    </STooltip >
    )
}
