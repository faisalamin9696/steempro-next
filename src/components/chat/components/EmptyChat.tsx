import React from 'react'
import { useTranslation } from '@/utils/i18n'

export default function EmptyChat({ username }: { username: string }) {
    const { t } = useTranslation();
    return (
        <p className='text-center text-default-600 mt-4 p-4 text-sm'>
            {t("community.start_chat_with").replace("{{username}}", username)} 💬
        </p>
    )
}
