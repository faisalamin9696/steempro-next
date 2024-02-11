import { headers } from 'next/headers';
import { validateCommunity } from './helper';


// Define valid categories
const valid_categories = ['trending', 'created', 'payout', 'important', 'about']

// Define username URL regex
const usernameURLRegex = /@([^/]+)/;

interface Params {
    category: string;
    username: string;
    permlink: string;
    tag: string;
    community: string;
}

const usePathnameServer = (): Params => {

    const headersList = headers();
    const pathname = headersList.get("pathname") ?? '';
    const params = {
        category: '',
        username: '',
        permlink: '',
        tag: '',
        community: ''
    };

    const splitted_path = pathname.split('/');

    splitted_path.shift();

    const [first_param, second_param, third_param] = splitted_path;

    // Check if the URL matches the pattern for a post
    if (splitted_path.length === 3 && usernameURLRegex.test(second_param)) {
        params.category = splitted_path[0]?.replace('@', '') ?? '';
        params.username = splitted_path[1]?.replace('@', '') ?? '';
        params.permlink = splitted_path[2] ?? '';
    }


    if (splitted_path.length === 2 && usernameURLRegex.test(first_param) && !valid_categories.includes(second_param)) {
        params.username = splitted_path[0]?.replace('@', '') ?? '';
        params.permlink = splitted_path[1] ?? '';
    }
    // Check if the URL matches the pattern for a profile
    else if (pathname.startsWith('/@')) {
        params.username = splitted_path[0]?.replace('@', '') ?? '';
        params.category = splitted_path[1]?.replace('@', '') ?? '';

    }
    // Check if the URL matches the pattern for a community
    else if (validateCommunity(second_param) && valid_categories.includes(first_param)) {
        params.category = splitted_path[0]?.replace('@', '') ?? '';
        params.community = splitted_path[1]?.replace('@', '') ?? '';
    }
    // Check if the URL matches the pattern for a category
    else if (valid_categories.includes(first_param)) {
        params.category = splitted_path[0]?.replace('@', '') ?? '';
        params.tag = splitted_path[1]?.replace('@', '') ?? '';
    }

    return params;
};

export default usePathnameServer;