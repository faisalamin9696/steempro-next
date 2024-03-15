import { usePathname } from 'next/navigation';
import { validateCommunity } from './helper';

interface Params {
    category: string;
    username: string;
    permlink: string;
    community: string;
    tag: string;

}

// Define valid categories

const valid_tabs = ['blogs', 'posts', 'friends',
    'comments', 'replies', 'wallet', 'communities', 'settings'];

const basic_categories = ['trending', 'created',
    'payout', 'communities'];

const valid_categories = basic_categories.concat(['important', 'about']);


// Define username URL regex
const usernameURLRegex = /@([^/]+)/;

const usePathnameClient = (): Params => {
    const pathname = usePathname();

    const params = {
        category: '',
        username: '',
        permlink: '',
        tag: '',
        community: ''
    };


    // Split the pathname into parts
    const splitted_path = pathname.split('/');

    // remove the first empty element
    splitted_path.shift();
    const [first_param, second_param, third_param] = splitted_path;

    // Check if the URL matches the pattern for a post
    if (splitted_path.length === 3 && usernameURLRegex.test(second_param)) {
        params.category = splitted_path[0]?.replace('@', '') ?? '';
        params.username = splitted_path[1]?.replace('@', '') ?? '';
        params.permlink = splitted_path[2] ?? '';
    }


    // check if the post without category
    if (splitted_path.length === 2 && usernameURLRegex.test(first_param) && !valid_tabs.includes(second_param)) {
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

export default usePathnameClient;