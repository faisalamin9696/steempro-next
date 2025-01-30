import React from 'react';
import { Tooltip as NextTooltip } from "@heroui/tooltip";
import clsx from 'clsx';

type OverlayPlacement = "top" | "bottom" | "right" | "left" | "top-start" | "top-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end" | "right-start" | "right-end";

interface TooltipProps {
    content?: string | React.ReactNode,
    children: React.ReactNode
    className?: string;
    placement?: OverlayPlacement

}
const STooltip = (props: TooltipProps) => {

    const { className, content, children, placement } = props;

    return (<div className={clsx(className)}>
        {content ?
            <NextTooltip placement={placement} content={content}>
                {children}
            </NextTooltip>
            :
            children}
    </div>


    );

}

export default STooltip;
