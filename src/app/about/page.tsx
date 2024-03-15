'use client';

import React from 'react'
import { AboutItem } from './_components/AboutItem';
import './style.scss'
import MainWrapper from '@/components/wrapper/MainWrapper';
import { Card } from '@nextui-org/react';

export default function AboutPage() {

    return (
        <MainWrapper >

            <div className='flex flex-col gap-6'>

                <Card className="dark:bg-white/20 items-center p-6 sm:p-10 rounded-lg flex flex-col gap-2">
                    <h1 className='text-lg font-bold font-serif'>About Us</h1>
                    <p className=' text-center'>SteemPro is a decentralized mobile and web application designed for the Steem blockchain, providing users with a secure platform for executing broadcast operations. Additionally, the application includes useful tools for evaluating author activities within the platform.
                    </p>
                </Card>

                <h2 className='text-2xl font-bold text-center'>
                    Our Team</h2>
                <div className="flex flex-row max-sm:flex-col gap-6 justify-center p-4">

                    <AboutItem username={'faisalamin'}
                        firstHeading={'Founder & Developer'}
                        secondHeading={'steempro.official@gmail.com'}
                    />

                    <AboutItem username={'steempro.com'}
                        firstHeading={'Official Account'}
                        secondHeading={'steempro.official@gmail.com'}
                    />






                </div>
            </div>
        </MainWrapper>
    )
}
