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
        <div id="container" className='gap-4 p-4 max-sm:p-2 '>
            {startContent && <div id="left"
                className={clsx(`hidden rounded-lg scrollbar-thin xl:block`, startClassName)}>
                <div>{startContent}</div>
            </div>
            }
            <div id="center">
                {children}
            </div>
            {endContent && <div id="right"
                className={clsx(endClassName, `rounded-lg scrollbar-thin 
                hidden md:block `,)}>
                <div>
                    {endContent}
                </div>
            </div>}

        </div>
        // <div id="container" className='text-default-900 gap-4 max-sm:px-2'>

        //     <div id="center">

        //     </div>

        // </div>
        // <div className='p-4 w-full flex relative text-default-900 
        // gap-4 flex-row max-w-7xl mx-auto max-sm:px-2'>

        //     {startContent && <div className='overflow-auto sticky self-start items-start top-[70px]
        //              w-96 max-md:hidden scrollbar-thin '>
        //         {startContent}
        //     </div>}


        //     <div className={clsx('w-full')} >
        //         {children}
        //     </div>

        //     {endContent && <div
        //         className='sticky self-start items-start top-[70px] max-h-[50vh]
        //              w-64 max-md:hidden overflow-auto scrollbar-thin h-full md:hidden lg:block' >
        //         {endContent}
        //     </div>
        //     }


        // </div>
    )
}
