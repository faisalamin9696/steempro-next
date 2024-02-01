"use client"

import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'

export default function CommunityAboutTab() {
    const { community } = usePathnameClient();

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                {community}
            </div>

        </div>
    )
}
