import moment from "moment";
import { fetchSds, mapSds } from "../constants/AppFunctions";


export const getActiveFeed = async (
    category: ValidCategories,
    observer: string = 'null',
    bodyLength: number = 250,
    limit: number = 1000,
    offset: number = 0,


): Promise<Feed[]> => {
    try {
        if (!category) {
            throw new Error('Invalid request');
        }
        const R_API = `/feeds_api/getActivePostsBy${category}/${observer}/${bodyLength}/${limit}/${offset}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Feed[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};

export const getActiveTagFeed = async (
    category: ValidCategories,
    tag: string,
    observer: string = 'null',
    bodyLength: number = 250,
    limit: number = 1000,
    offset: number = 0,

): Promise<Feed[]> => {
    try {
        if (!category) {
            throw new Error('Invalid request');
        }
        const R_API = `/feeds_api/getActivePostsByTag${category}/${observer}/${bodyLength}/${limit}/${offset}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Feed[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};

export const getActiveCommunityFeed = async (
    category: ValidCategories,
    community: string,
    observer: string = 'null',
    bodyLength: number = 250,
    limit: number = 1000,
    offset: number = 0,

): Promise<Feed[]> => {
    try {
        if (!category) {
            throw new Error('Invalid request');
        }
        const R_API = `/feeds_api/getActiveCommunityPostsBy${category}/${community}/${observer}/${bodyLength}/${limit}/${offset} `;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Feed[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};

export type FeedTypes = 'PostsByAuthor' | 'AccountFriendsFeed' | 'CommentsByAuthor' |
    'CommentsByParentAuthor' | 'ActiveCommunityPostsByTrending'
    | 'CommunityPostsByCreated' | 'CommunityPinnedPosts' | 'AccountBlog';

export const getAuthorFeed = async (
    author: string,
    observer: string = 'null',
    feedType: FeedTypes,
    bodyLength: number = 250,
    limit: number = 1000,
    offset: number = 0,


): Promise<Feed[]> => {
    try {
        if (!author) {
            throw new Error('Invalid request');
        }
        const R_API = `/feeds_api/get${feedType ?? 'PostsByAuthor'}/${author}/${observer}/${bodyLength}/${limit}/${offset}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Feed[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};


export const getPinnedFeed = async (
    community: string,
    observer: string = 'null',
    bodyLength: number = 250,
): Promise<Feed[]> => {
    try {
        if (!community) {
            throw new Error('Invalid request');
        }
        const R_API = `/communities_api/getCommunityPinnedPosts/${community}/${observer}/${bodyLength}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Feed[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};


export const getAuthorExt = async (
    account: string,
    observer: string = 'null',
): Promise<AccountExt> => {
    try {

        if (!account) {
            throw new Error('Invalid request');
        }
        const R_API = `/accounts_api/getAccountExt/${account}/${observer}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {

            return response as AccountExt;
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};


export const getCommunity = async (
    community: string,
    observer: string = 'null',
): Promise<Community> => {
    try {

        if (!community) {
            throw new Error('Invalid request');
        }
        const R_API = `/communities_api/getCommunity/${community}/${observer}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {

            return response as Community;
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};



export const getAuthorCommunities = async (
    subscriber: string,
    observer: string = 'null',
    limit: number = 50,
    offset: number = 0
): Promise<Community[]> => {
    try {
        if (!subscriber) {
            throw new Error('Invalid request');
        }
        const R_API = `/communities_api/getCommunitiesBySubscriber/${subscriber}/${observer}/${limit}/${offset}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Community[];
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};


export const getPost = async (
    author: string,
    permlink: string,
    observer: string = 'null',
    withVotes: boolean = true,
): Promise<Post> => {
    try {
        if (!author) {
            throw new Error('Invalid request');
        }
        const R_API = `/posts_api/getPost/${author}/${permlink}/${withVotes}/${observer}`;
        console.log(R_API);

        const response = await fetchSds<any>(R_API);
        // if the response is successful, parse the JSON and check if it's valid
        if (response) {
            return response as Post;
        } else {
            throw new Error(response);
        }

    } catch (error: any) {
        // log and re-throw any errors that occur
        console.error('Failed to fetch post:', error);
        throw new Error(error);
    }
};


export const getVoteData = (
    account: AccountExt,
    steemprops: SteemProps,
    downvote?: boolean
): VoteData => {
    const total_vests = account.vests_own + account.vests_in - account.vests_out;
    const final_vest = total_vests * 1e6;
    const power = (downvote ? account.downvote_mana_percent : account.upvote_mana_percent) / 50;
    const rshares = (power * final_vest) / 10000;

    const g =
        (steemprops.total_vesting_shares / steemprops.total_vesting_fund_steem) *
        (steemprops.total_reward_fund / steemprops.recent_reward_claims) *
        steemprops.median_price;

    const full_vote_value =
        (rshares / steemprops.recent_reward_claims) *
        steemprops.total_reward_fund *
        steemprops.median_price *
        100;

    const current_vp = downvote ? account.downvote_mana_percent : account.upvote_mana_percent;
    const current_vote_value = (full_vote_value * current_vp) / 100;

    return {
        full_vote: full_vote_value,
        current_vote: current_vote_value,
        voting_power: current_vp,
        resource_credit: account.rc_mana_percent,
    };
};


export const getSteemGlobal = async (): Promise<SteemProps> => {
    try {
        const R_API = `/steem_requests_api/getSteemProps`;
        console.log(R_API);
        const response = await fetchSds<any>(R_API);
        if (response) {

            return response;
        } else {
            throw new Error(response);
        }
    }
    catch (error: any) {
        console.error('Failed to fetch global variables:', error);
        throw new Error(error);
    }
};


export const getPostReplies = async (
    author: string,
    permlink: string,
    observer: string = 'null',
    withVotes: boolean = true,
): Promise<Post[]> => {
    try {
        const R_API = `/posts_api/getPostReplies/${author}/${permlink}/${withVotes}/${observer}`;
        console.log(R_API);
        const response = await fetchSds<any>(R_API);
        if (response) {
            return response as Post[];
        } else {
            throw new Error(response);
        }
    }
    catch (error: any) {
        console.error('Failed to fetch global variables:', error);
        throw new Error(error);
    }
};


export const getClubStatus = async (username: string) => {
    const date_from = moment().subtract(1, "months").unix();
    const date_to = moment().unix();
    const R_API = `/stats_api/getClubStats/${username}/${date_from}-${date_to}`;
    // console.log(R_API);
    try {
        const response = await fetchSds<Stats>(R_API);


        if (response) {


            const trx_out = mapSds(response.transfers_out) as Transfer[];
            const trx_in = mapSds(response.transfers_out) as Transfer[];
            const vests_in = mapSds(response.vesting_in) as Transfer[];
            const vests_out = mapSds(response.vesting_out) as Transfer[];



            let total_trx_out = trx_out.reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

            let total_trx_in = trx_in.reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

            let total_trx_vests_in = vests_in.reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

            let total_trx_vests_out = vests_out.reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

            console.log(1122, total_trx_vests_in, total_trx_vests_out, total_trx_out, total_trx_in)
            const trx_steem_in = total_trx_vests_in - total_trx_vests_out;

            const grand_total = trx_steem_in + total_trx_out + total_trx_vests_out;

            const powered_up = (total_trx_vests_out / grand_total) * 100;
            const transfer_in = (trx_steem_in / grand_total) * 100;
            const transfer_out = (total_trx_out / grand_total) * 100;

            return { powered_up, transfer_in, transfer_out } satisfies Club;
        } else {
            throw new Error(response);
        }
    }
    catch (error: any) {
        console.error('Failed to fetch club data:', error);
        throw new Error(error);
    }
};