# Translation Feature - Usage Guide

## Quick Start

The translation feature is now integrated into `PostHeader` and `CommentHeader` components.

## Usage in Post Detail Pages

```tsx
"use client";

import { useState } from "react";
import PostHeader from "@/components/post/PostHeader";
import MarkdownViewer from "@/components/post/body/MarkdownViewer";

export default function PostDetailPage({ post }: { post: Post }) {
  // Translation state
  const [translatedBody, setTranslatedBody] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>();

  const handleTranslate = (translated: string, language: string) => {
    setTranslatedBody(translated);
    setIsTranslated(true);
    setCurrentLanguage(language);
  };

  const handleResetTranslation = () => {
    setTranslatedBody(null);
    setIsTranslated(false);
    setCurrentLanguage(undefined);
  };

  return (
    <div>
      <PostHeader
        comment={post}
        isDetail
        showTranslate
        onTranslate={handleTranslate}
        onResetTranslation={handleResetTranslation}
        isTranslated={isTranslated}
        currentLanguage={currentLanguage}
      />

      <MarkdownViewer body={translatedBody || post.body} />
    </div>
  );
}
```

## CommentCard

Translation is **automatically enabled** in `CommentCard` component. No additional setup required!

## Features

- ✅ **15 Languages**: English, Urdu, Bengali, Hindi, German, Spanish, French, Arabic, Chinese, Japanese, Korean, Portuguese, Russian, Turkish, Indonesian
- ✅ **One-Click Translation**: Select language from dropdown
- ✅ **Toggle Original/Translated**: Click button again to show original
- ✅ **Toast Notifications**: Success/error feedback
- ✅ **Mobile Responsive**: Works on all screen sizes

## Setup Required

Add to `.env.local`:

```
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
