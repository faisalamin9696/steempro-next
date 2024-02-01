import { Card, Button } from '@nextui-org/react'
import error from 'next/error'
import React from 'react'
import MainWrapper from './wrapper/MainWrapper'

type Props = {
    message?: string;
    onPress?: () => void;
}

export default function ErrorCard(props: Props) {
    const { message, onPress } = props;
    return (
        <MainWrapper fullScreen>
            <Card className=" bg-gray-50 dark:bg-gray-700">
                <div className="p-6 flex flex-col gap-6 text-center whitespace-pre-line overflow-hidden">
                    <p className='text-xl text-default-900 font-bold'>Something went wrong!</p>
                    <p className='text-md text-default-700 whitespace-pre-wrap' style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {message}
                    </p>
                    <Button color='primary' className='self-center' onPress={onPress}>Try again</Button>


                </div>
            </Card>
        </MainWrapper>
    )
}
