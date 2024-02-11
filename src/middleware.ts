import { validateCommunity } from '@/libs/utils/helper';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define valid categories
const valid_categories = ['trending', 'created',
    'payout', 'important', 'about']

// Define username URL regex
const usernameURLRegex = /@([^/]+)/;

export function middleware(request: NextRequest) {
    // Set pathname header
    request.headers.set('pathname', request.nextUrl.pathname);

    // Split the pathname into parts
    const splitted_path = request.nextUrl.pathname.split('/');

    // remove the first empty element
    splitted_path.shift();
    const [first_param, second_param, third_param] = splitted_path;

    // Check if the URL matches the pattern for a post
    if (splitted_path.length === 3 && usernameURLRegex.test(second_param)) {
        return NextResponse.rewrite(new URL('/post', request.nextUrl), { headers: request.headers });
    }
    else if (splitted_path.length === 2 && usernameURLRegex.test(first_param) && !valid_categories.includes(second_param)) {
        return NextResponse.rewrite(new URL('/post', request.nextUrl), { headers: request.headers });
    }
    // Check if the URL matches the pattern for a profile
    else if (request.nextUrl.pathname.startsWith('/@')) {
        return NextResponse.rewrite(new URL(`/profile`, request.nextUrl), { headers: request.headers });
    }

    // Check if the URL matches the pattern for a community
    else if (validateCommunity(second_param) && valid_categories.includes(first_param)) {
        return NextResponse.rewrite(new URL(`/community`, request.nextUrl), { headers: request.headers });
    }
    // Check if the URL matches the pattern for a category
    else if (valid_categories.includes(first_param)) {
        return NextResponse.rewrite(new URL('/category', request.nextUrl), { headers: request.headers });
    }
}