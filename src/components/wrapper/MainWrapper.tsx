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
    className?: string;



}

export default function MainWrapper(props: Props) {
    const { children, className, startContent, endContent, endClassName, startClassName } = props;
    return (
        <div className="main-container gap-4 px-4 pt-4 max-sm:px-2 max-sm:pt-2">

            {startContent && <div
                className={clsx(`left hidden rounded-lg scrollbar-thin xl:block`, startClassName)}>
                <div>{startContent}</div>
            </div>
            }
            <div className={clsx('center-div', className)}>
                {children}
            </div>


            {endContent && <div
                className={clsx(endClassName, `right rounded-lg scrollbar-thin 
                hidden lg:block `,)}>
                <div>
                    {endContent}
                </div>
            </div>}
        </div >
    )
}
