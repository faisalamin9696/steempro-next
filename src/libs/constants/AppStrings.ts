import { appLink } from "./AppConstants";

export const AppStrings = {
    steemit_base_url: 'https://steemit.com',
    sds_base_url: 'https://sds0.steemworld.org',
    image_hosting: ['https://steemitimages.com'],
    rpc_servers: [
        'https://api.steemit.com',
        'https://api.steemyy.com',
        'https://rpc.amarbangla.net',
        'https://steemapi.boylikegirl.club',
        'https://api.steem-fanbase.com',
        'https://api.steemitdev.com',
        'https://api.steem.fans',
    ],
    chain_id: '0000000000000000000000000000000000000000000000000000000000000000',
    chain_prefix: 'STM',
    chain_timeout: 5000,
    official_email: 'steempro.official@gmail.com',
    key_types: {
        posting: 'POSTING',
        active: 'ACTIVE',
        owner: 'OWNER',
        master: 'MASTER',
        memo: 'MEMO',
    },
    promotion_text: `<center><sub>Posted using [SteemPro](${appLink})</sub></center>`,


}