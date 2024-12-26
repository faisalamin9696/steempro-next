import { Button } from "@nextui-org/button";
import { memo } from "react";
import { IconType } from "react-icons";

interface ToolbarItemProps {
    tooltip: { description: string, shortcut: string };
    onSelect?: (command: string) => void;
    IconType: IconType,
    size?: 'sm' | 'md' | 'lg';
    isDisabled?: boolean;
}
export const ToolbarItem = memo((props: ToolbarItemProps) => {
    const { tooltip, onSelect, IconType, size, isDisabled } = props
    const { description, shortcut } = tooltip;

    return <Button size={size ?? 'sm'} isDisabled={isDisabled}
        title={description + ` (${shortcut})`}
        isIconOnly className='border-none' onPress={() =>
            onSelect && onSelect('b')}>
        <IconType className='text-lg rounded-none' />
    </Button>
})