"use client"

import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'


export default function CommunityEnd() {
    const { username } = usePathnameClient();
    return (
        <div>Community End</div>
    )
}