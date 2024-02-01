import STooltip from "@/components/STooltip";
import { Button } from "@nextui-org/react";
import { IconType } from "react-icons";

const ToolbarTip = (description: string, shortcut: string) => (
    <span>
        {description + ` (${shortcut})`}
    </span>
);


interface ToolbarItemProps {
    tooltip: { description: string, shortcut: string };
    onSelect?: (command: string) => void;
    IconType: IconType,
    size?: 'sm' | 'md' | 'lg';
}
export const ToolbarItem = (props: ToolbarItemProps) => {
    const { tooltip, onSelect, IconType, size } = props

    return <STooltip
        content={ToolbarTip(tooltip.description, tooltip.shortcut)}
    >
        <Button size={size ?? 'sm'} isIconOnly className='border-none' onClick={() =>
            onSelect && onSelect('b')}>
            <IconType className='text-lg rounded-none' />
        </Button>
    </STooltip>
}