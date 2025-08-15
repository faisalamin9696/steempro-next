import React from 'react'
import { useTranslation } from '@/utils/i18n'

export default function EmptyList({ text }: { text?: string }) {
    const { t } = useTranslation();
    
    return (
        <p className='text-center text-default-600 mt-4 p-4 text-sm'>
            {text ?? t('feed.seen_all')} 🌟
        </p>
    )
}
