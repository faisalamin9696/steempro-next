import { IconType } from 'react-icons';
import clsx, { ClassValue } from 'clsx';
import { Button } from '@nextui-org/button';

interface Props {
    children?: React.ReactNode,
    IconType: IconType,
    tooltip?: string,
    onClick?: () => void,
    className?: ClassValue | undefined;
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost" | undefined
    iconClassName?: ClassValue | undefined;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
    href?: string;
}
const IconButton = (props: Props) => {
    const { children, color, IconType, onClick, href, tooltip, className, iconClassName, size, isLoading, variant } = props;

    return <Button
        color={color}
        isLoading={isLoading}
        isIconOnly
        radius="full"
        className={clsx("text-default-900/60 data-[hover]:bg-foreground/10", className)}
        variant={variant ?? 'light'}
        size={size}
        href={href}
        onClick={onClick} >
        <IconType className={clsx(size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-3xl' : ' text-2xl', iconClassName)}
        />
    </Button>
}

export default IconButton