import { Button } from "@nextui-org/react";
import { memo } from "react";
import { IconType } from "react-icons";

interface ToolbarItemProps {
    tooltip: { description: string, shortcut: string };
    onSelect?: (command: string) => void;
    IconType: IconType,
    size?: 'sm' | 'md' | 'lg';
}
export const ToolbarItem = memo((props: ToolbarItemProps) => {
    const { tooltip, onSelect, IconType, size } = props
    const { description, shortcut } = tooltip;

    return <Button size={size ?? 'sm'}
        title={description + ` (${shortcut})`}
        isIconOnly className='border-none' onClick={() =>
            onSelect && onSelect('b')}>
        <IconType className='text-lg rounded-none' />
    </Button>
})