import React from 'react';
import './style.scss'
import clsx, { ClassValue } from 'clsx';
interface Props {
    children: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    fullScreen?: boolean;
    endClassName?: ClassValue | undefined;
    startClassName?: ClassValue | undefined;



}

export default function MainWrapper(props: Props) {
    const { children, startContent, endContent, endClassName, startClassName } = props;
    return (
        <div id="container" className='gap-4 px-4 pt-4 max-sm:px-2 max-sm:pt-2'>
            {startContent && <div id="left"
                className={clsx(`hidden rounded-lg scrollbar-thin xl:block`, startClassName)}>
                <div>{startContent}</div>
            </div>
            }
            {children}
            {endContent && <div id="right"
                className={clsx(endClassName, `rounded-lg scrollbar-thin 
                hidden lg:block `,)}>
                <div>
                    {endContent}
                </div>
            </div>}

        </div>
        
    )
}
