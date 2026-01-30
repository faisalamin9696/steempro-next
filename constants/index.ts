export const Constants = {
  official_account: "steempro.com",
  funds_account: "steempro.funds",
  official_community: "hive-160125",

  site_url: "https://steempro.com",
  sds_url: "https://sds0.steemworld.org",
  steemit_url: "https://steemit.com",
  signup_link: "https://signup.steemit.com/",
  image_servers: [
    "https://steemitimages.com",
    //  "https://images.steempro.com"
  ],
  mobile_app_link:
    "https://play.google.com/store/apps/details?id=com.steempro.mobile",
  official_email: "steempro.official@gmail.com",
  github_link: "https://github.com/faisalamin9696/steempro-next",
  discord_link: "https://discord.gg/SXpWY8FGCB",
  witness_name: "faisalamin",
  team: [
    {
      name: "faisalamin",
      role: "Founder",
    },
    {
      name: "steempro.com",
      role: "Official Account",
    },
  ],
  chain_id: "0000000000000000000000000000000000000000000000000000000000000000",
  rpc_servers: [
    "https://api.steemit.com",
    "https://api.steemyy.com",
    "https://api.steempro.com",
    "https://rpc.amarbangla.net",
    "https://steemapi.boylikegirl.club",
    "https://api.steem-fanbase.com",
    "https://api.steemitdev.com",
    "https://api.steem.fans",
  ],
  chain_timeout: 5000,
  wallet_key_types: {
    posting: "POSTING",
    active: "ACTIVE",
    owner: "OWNER",
    master: "MASTER",
    memo: "MEMO",
  },
  reward_types: [
    { title: "Decline Payout", shortTitle: "Declined", payout: 0 },
    { title: "50% SBD / 50% SP", shortTitle: "50/50", payout: 50 },
    { title: "Power Up 100%", shortTitle: "100%", payout: 100 },
  ] as Payout[],

  setting: {
    lang: { code: "en", title: "English" },
    nsfw: "Always warn",
    feed_style: "list",
    rpc: "https://api.steemit.com",
    auto_rpc: true,
    theme: "system",
    vote: {
      remember: true,
      value: 100,
    },
    long_press_vote: {
      enabled: false,
      users: [],
    },
    favourite_bene: [],
    image_server: "https://steemitimages.com",
  } as Setting,

  get activeSettings(): Setting {
    return this.setting;
  },
  set activeSettings(setting: Setting) {
    this.setting = setting;
  },

  globals: {} as GlobalProps,

  get globalProps(): GlobalProps {
    return this.globals;
  },
  set globalProps(globals: GlobalProps) {
    this.globals = globals;
  },

  default_notifications_filter: {
    status: true,
    vote: {
      status: false,
      minRep: 25,
      minSp: 15,
      minVote: 0.001,
    },
    reply: {
      status: false,
      minRep: 25,
      minSp: 0,
    },
    follow: {
      status: false,
      minRep: 0,
      minSp: 0,
    },
    mention: {
      status: false,
      minRep: 25,
      minSp: 0,
    },
    resteem: {
      status: false,
      minRep: 25,
      minSp: 0,
    },
  },
  get notifications_filter() {
    return {
      mention: {
        // exclude: this.default_notifications_filter.mention.status,
        minSP: this.default_notifications_filter.mention.minSp,
        minReputation: this.default_notifications_filter.mention.minRep,
      },
      vote: {
        // exclude: this.default_notifications_filter.vote.status,
        minVoteAmount: this.default_notifications_filter.vote.minVote,
        minReputation: this.default_notifications_filter.vote.minRep,
        minSP: this.default_notifications_filter.vote.minSp,
      },
      follow: {
        // exclude: this.default_notifications_filter.follow.status,
        minSP: this.default_notifications_filter.follow.minSp,
        minReputation: this.default_notifications_filter.follow.minRep,
      },
      resteem: {
        // exclude: this.default_notifications_filter.resteem.status,
        minSP: this.default_notifications_filter.resteem.minSp,
        minReputation: this.default_notifications_filter.resteem.minRep,
      },
      reply: {
        // exclude: this.default_notifications_filter.reply.status,
        minSP: this.default_notifications_filter.reply.minSp,
        minReputation: this.default_notifications_filter.reply.minRep,
      },
    };
  },
};
