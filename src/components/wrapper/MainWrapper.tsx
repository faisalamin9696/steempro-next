import React from 'react';
import './style.scss'
import clsx from 'clsx';
interface Props {
    children: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    fullScreen?: boolean;

}

export default function MainWrapper(props: Props) {
    const { children, startContent, endContent, fullScreen } = props;
    return (
        <div className='flex flex-col text-black '>
            <div className='p-4 w-full flex  gap-4  flex-row max-w-7xl text-black relative mx-auto max-sm:px-2'>
                {/* {!fullScreen && <div className='flex-[2] mx-4 max-h-[500px] p-2 hidden md:block float-left min-h-[150px] sticky self-start items-start top-[70px] dark:bg-default-900/30 bg-default-900/5 rounded-md'>
                    {startContent}
                </div>} */}

                <div className={clsx(fullScreen ? 'w-full' : 'flex-[8] overflow-hidden p-1')} >
                    {children}
                </div>

                {!fullScreen && <div
                    className=' max-h-[50vh]  max-md:hidden overflow-auto scrollbar-thin h-full' >
                    {endContent}
                </div>
                }
            </div>
        </div >
    )
}
