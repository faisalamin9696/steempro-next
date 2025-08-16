import { AppLink } from "./AppConstants";

export const AppStrings = {
  official_account: "team-cn",
  steempro_base_url: "https://steemcn.blog",
  steempro_site_url: "https://steemcn.blog",
  steemit_base_url: "https://steemit.com",
  sds_base_url: "https://sds0.steemworld.org",
  image_hostings: ["https://steemitimages.com"],
  chain_id: "0000000000000000000000000000000000000000000000000000000000000000",
  rpc_servers: [
    "https://api.steemyy.com",
    "https://api.steemit.com",
    "https://rpc.amarbangla.net",
    "https://steemapi.boylikegirl.club",
    "https://api.steem-fanbase.com",
    "https://api.steemitdev.com",
    "https://api.steem.fans",
  ],
  chain_timeout: 5000,
  official_email: "steemit.teamcn@gmail.com",
  key_types: {
    posting: "POSTING",
    active: "ACTIVE",
    owner: "OWNER",
    master: "MASTER",
    memo: "MEMO",
  },
  promotion_text: `<center><sub>Posted using [SteemCN](${AppLink})</sub></center>`,
};
