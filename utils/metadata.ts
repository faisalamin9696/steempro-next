import { auth } from "@/auth";
import { extractBodySummary } from "./extractContent";
import { ResolvingMetadata } from "next";
import { getResizedAvatar, getThumbnail } from "./image";
import { sdsApi } from "@/libs/sds";

const DEFAULT_DESCRIPTION =
  "SteemPro is a decentralized social media platform powered by the Steem blockchain. Explore trending discussions, join vibrant communities, and share your unique perspective.";

export const getMetadata = {
  home: (category: string) => {
    category = category?.toLowerCase();
    if (!category) category = "trending";
    const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `${capCat} topics`;
    const pageDescription = `Explore ${category} discussions on a user-owned social network. ${capCat} topics cover a wide range of interests and perspectives, providing valuable insights and lively conversations.`;
    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical:
          category === "trending"
            ? "https://www.steempro.com"
            : `https://www.steempro.com/${category}`,
      },
    };
  },
  profileAsync: async (username: string, tab: string) => {
    username = username?.toLowerCase();
    tab = tab?.toLowerCase();
    if (!tab) {
      tab = "blog";
    }
    const session = await auth();

    const result = await sdsApi.getAccountExt(username, session?.user?.name);
    const { name, about, website } =
      JSON.parse(result.posting_json_metadata || "{}")?.profile ?? {};
    const capCat = tab.charAt(0).toUpperCase() + tab.slice(1);
    const pageTitle = !!name
      ? `${name} (@${username}) - ${capCat} on the Decentralized Web`
      : `@${username} - ${capCat} on the Decentralized Web`;
    const pageDescription = about || DEFAULT_DESCRIPTION;

    const keywords = [
      `SteemPro @${username}`,
      `${tab} by @${username}`,
      `${username}'s SteemPro profile`,
      `SteemPro user ${username}`,
      `decentralized ${tab} content`,
      `Steem ${tab} by ${username}`,
      `blockchain blogging profile`,
      `crypto social posts by ${username}`,
      `${username} ${tab} on SteemPro`,
      `Web3 creator ${username}`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      alternates: {
        canonical: `https://www.steempro.com/@${username}`,
      },
    };
  },
  profileStructuredData: (username: string, account: AccountExt) => {
    const { name, about } =
      JSON.parse(account.posting_json_metadata || "{}")?.profile ?? {};
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: name || username,
      alternateName: username,
      description: about,
      image: getResizedAvatar(username, "large"),
      url: `https://www.steempro.com/@${username}`,
    };
  },
  profileSync: (username: string, tab: string, account: AccountExt) => {
    username = username?.toLowerCase();
    tab = tab?.toLowerCase();
    if (!tab) {
      tab = "blog";
    }
    const { name, about, website } =
      JSON.parse(account.posting_json_metadata || "{}")?.profile ?? {};
    const capCat = tab.charAt(0).toUpperCase() + tab.slice(1);
    const pageTitle = !!name
      ? `${name} (@${username}) - ${capCat} on the Decentralized Web`
      : `@${username} - ${capCat} on the Decentralized Web`;
    const pageDescription = about || DEFAULT_DESCRIPTION;

    const keywords = [
      `SteemPro @${username}`,
      `${tab} by @${username}`,
      `${username}'s SteemPro profile`,
      `SteemPro user ${username}`,
      `decentralized ${tab} content`,
      `Steem ${tab} by ${username}`,
      `blockchain blogging profile`,
      `crypto social posts by ${username}`,
      `${username} ${tab} on SteemPro`,
      `Web3 creator ${username}`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      alternates: {
        canonical: `https://www.steempro.com/@${username}`,
      },
    };
  },
  category: (category: string, tag: string) => {
    category = category?.toLowerCase();
    tag = tag?.toLowerCase();
    // const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `Latest #${tag} ${category} topics on the Internet`;
    const pageDescription = `Explore the latest ${category} discussions and topics related to #${tag} on the internet. Stay updated with the most recent conversations and insights.`;
    const keywords = [
      `SteemPro ${tag} ${category} content`,
      `Latest ${category} discussions on SteemPro`,
      `SteemPro #${tag} ${category} conversations`,
      `Insightful ${category} posts on SteemPro`,
      `Trending ${category} topics on SteemPro #${tag}`,
      `Popular ${category} debates – SteemPro ${tag}`,
      `SteemPro ${category} analysis & updates`,
      `#${tag} ${category} news from SteemPro`,
      `Engaging ${category} discussions – SteemPro ${tag}`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords,
      alternates: {
        canonical: `https://www.steempro.com/${category}/${tag}`,
      },
    };
  },
  communities: () => {
    return {
      title: `Communities on SteemPro - Join Engaging Discussions`,
      description: `Explore diverse communities on SteemPro, a user-owned social network. Join engaging discussions, share your passions, and connect with like-minded individuals.`,
      keywords: [
        "SteemPro communities",
        "user-owned social network",
        "engaging discussions",
        "connect with like-minded individuals",
        "share your passions",
        "diverse communities",
        "blockchain social network",
        "decentralized social media",
        "crypto social network",
        "SteemPro platform",
      ],
      alternates: {
        canonical: "https://www.steempro.com/communities",
      },
    };
  },
  market: () => {
    return {
      title: `SteemPro Market – Buy, Sell, and Discover Digital Assets on the Steem Blockchain`,
      description: `Explore the SteemPro Market – a decentralized marketplace to trade digital assets, tokens, NFTs, and services on the Steem blockchain. Fast, secure, and user-driven.`,
      keywords: [
        "steempro market",
        "steem marketplace",
        "steem blockchain trading",
        "steem nft",
        "steem token sale",
        "digital assets steem",
        "steem commerce",
        "decentralized marketplace",
        "steem market app",
        "steempro buy sell",
      ],
      alternates: {
        canonical: "https://www.steempro.com/market",
      },
    };
  },
  postAsync: async (author: string, permlink: string) => {
    author = author?.toLowerCase();
    permlink = permlink?.toLowerCase();
    const result = await sdsApi.getPost(author, permlink);
    const isReply = result?.depth > 0;

    const thumbnail = isReply
      ? getResizedAvatar(result?.author, "small")
      : getThumbnail(result.json_images, "640x480");
    const pageTitle = isReply ? `RE: ${result?.root_title}` : result?.title;
    const pageDescription =
      extractBodySummary(result?.body, 250, isReply) +
        " by " +
        result?.author || DEFAULT_DESCRIPTION;

    const keywords = [
      `SteemPro @${result.author}`,
      `${result.title} post`,
      `post by @${result.author}`,
      `content from ${result.author} on SteemPro`,
      `${result.author}'s blockchain blog`,
      `decentralized blogging on SteemPro`,
      `Steem blockchain post`,
      `crypto social content`,
      `web3 blogging platform`,
      `SteemPro content by ${result.author}`,
      `@${result.author} SteemPro posts`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      thumbnail,
      alternates: {
        canonical: `https://www.steempro.com/@${author}/${permlink}`,
      },
    };
  },
  postStructuredData: (post: Post) => {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: extractBodySummary(post.body, 160),
      image: getThumbnail(post.json_images, "640x480"),
      author: {
        "@type": "Person",
        name: post.author,
        url: `https://www.steempro.com/@${post.author}`,
      },
      datePublished: new Date(post.created * 1000).toISOString(),
      dateModified: new Date(post.last_update * 1000).toISOString(),
      publisher: {
        "@type": "Organization",
        name: "SteemPro",
        logo: {
          "@type": "ImageObject",
          url: "https://www.steempro.com/favicon.ico",
        },
      },
    };
  },
  communityAsync: async (
    category: string,
    tag: string,
    parent: ResolvingMetadata,
  ) => {
    category = category?.toLowerCase();
    tag = tag?.toLowerCase();
    const community = `hive-${tag}`;
    const previousImages = (await parent)?.openGraph?.images || [];
    const result = await sdsApi.getCommunity(community);
    const { title, about } = result ?? {};
    const pageTitle = title
      ? `${title} - ${category} in the ${community} Community`
      : `${community} Community ${category} List`;
    const pageDescription = about || DEFAULT_DESCRIPTION;

    const keywords = [
      `${community} community discussions`,
      `${community} ${category} content`,
      `${title} - ${community} on SteemPro`,
      `latest ${category} from ${community}`,
      `top ${category} topics in ${community}`,
      `#${community} news and updates`,
      `#${category} posts on SteemPro`,
      `${category} conversations at ${community}`,
      `${community} ${category} insights`,
      `${community} trending ${category}`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      images: [getResizedAvatar(result.account, "medium"), ...previousImages],
    };
  },

  communitySync: (category: string, community: Community) => {
    category = category?.toLowerCase();
    const { title, about } = community ?? {};
    const pageTitle = title
      ? `${title} - ${category} in the ${community} Community`
      : `${community} Community ${category} List`;
    const pageDescription = about || DEFAULT_DESCRIPTION;

    const keywords = [
      `${community} community discussions`,
      `${community} ${category} content`,
      `${title} - ${community} on SteemPro`,
      `latest ${category} from ${community}`,
      `top ${category} topics in ${community}`,
      `#${community} news and updates`,
      `#${category} posts on SteemPro`,
      `${category} conversations at ${community}`,
      `${community} ${category} insights`,
      `${community} trending ${category}`,
    ];
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
    };
  },
  proposals: () => {
    return {
      title: "SteemPro Proposals - Fund and Support Community Projects",
      description:
        "Explore and support community-driven projects on SteemPro. Vote for proposals that enhance the Steem ecosystem and help shape the future of decentralized social media.",
      alternates: {
        canonical: "https://www.steempro.com/proposals",
      },
    };
  },

  proposalAsync: async (id: string) => {
    try {
      const proposal = await sdsApi.getProposal(Number(id));
      if (proposal) {
        const result = await sdsApi.getPost(
          proposal.creator,
          proposal.permlink,
        );

        const thumbnail = getThumbnail(result.json_images, "640x480");

        const pageTitle = result?.title;
        const pageDescription = pageTitle + ` proposal by @${result?.author}`;

        return {
          title: pageTitle,
          description: pageDescription,
          thumbnail,
        };
      }
      return {
        title: `Proposal #${id}`,
        description: DEFAULT_DESCRIPTION,
        thumbnail: "",
      };
    } catch (error) {
      return {
        title: `Proposal #${id}`,
        description: DEFAULT_DESCRIPTION,
        thumbnail: "",
      };
    }
  },

  schedules: () => {
    return {
      title: "Scheduled posts",
      description:
        "Manage your scheduled posts easily with SteemPro. View, edit, and delete scheduled posts in one place. Stay organized and keep your content strategy on track.",
      keywords: "SteemPro, schedule posts, scheduling",
      alternates: {
        canonical: "https://www.steempro.com/schedules",
      },
    };
  },
  settings: () => {
    return {
      title: `Settings - Customize Your SteemPro Experience`,
      description: `Explore the settings page on SteemPro to personalize and optimize your experience on the Steem blockchain. Customize your preferences, security settings, notifications, and more to tailor SteemPro to your needs and preferences.`,
      alternates: {
        canonical: "https://www.steempro.com/settings",
      },
    };
  },
  submit: () => {
    const keywords = [
      "submit posts to SteemPro",
      "share ideas with global audience",
      "SteemPro community",
      "submit articles to SteemPro",
      "reach global audience",
      "SteemPro contributions",
      "SteemPro content submission",
      "share stories on SteemPro",
      "SteemPro ideas",
      "SteemPro platform",
    ];
    return {
      title: `Create and Submit - Share Your Ideas with the World!`,
      description: `Submit your posts, articles, and content to SteemPro and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`,
      keywords,
      alternates: {
        canonical: "https://www.steempro.com/submit",
      },
    };
  },
  tools: () => {
    const keywords = [
      "SteemPro tools",
      "Steem tools",
      "enhancing Steem experience",
      "Steem user tools",
      "boost Steem efficiency",
      "streamline Steem interactions",
      "powerful Steem tools",
      "Steem productivity",
      "Steem utilities",
      "SteemPro platform",
    ];

    return {
      title: `SteemPro Tools - Enhancing Your Steem Experience`,
      description: `Discover a suite of powerful tools tailored for Steem users, designed to streamline your interactions, boost efficiency, and elevate your Steem experience to new heights.`,
      keywords,
      alternates: {
        canonical: "https://www.steempro.com/tools",
      },
    };
  },
  witnesses: () => {
    const keywords = [
      "Steem blockchain witnesses",
      "trusted block producers",
      "Steem block producers",
      "blockchain security",
      "blockchain governance",
      "Steem blockchain",
      "witness role",
      "witness contributions",
      "Steem network",
      "block producer responsibilities",
    ];

    return {
      title: `Steem Blockchain Witnesses: Trusted Block Producers`,
      description: `Discover the trusted witnesses (block producers) contributing to the security and governance of the Steem blockchain. Learn about their role and contributions.`,
      keywords,
      alternates: {
        canonical: "https://www.steempro.com/witnesses",
      },
    };
  },
};

interface MetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

export const updateMetadata = (options: MetadataOptions): void => {
  const { title, description, keywords, image, url } = options;

  // Update document title
  document.title = title;

  // Update meta description
  updateMetaTag("name", "description", description);

  // Update keywords
  if (keywords) {
    updateMetaTag("name", "keywords", keywords.join(", "));
  }

  // Update Open Graph tags
  updateMetaTag("property", "og:title", title);
  updateMetaTag("property", "og:description", description);
  updateMetaTag("property", "og:url", url || window.location.href);
  if (image) {
    updateMetaTag("property", "og:image", image);
  }

  // Update Twitter Card tags
  updateMetaTag("name", "twitter:title", title);
  updateMetaTag("name", "twitter:description", description);
  if (image) {
    updateMetaTag("name", "twitter:image", image);
  }
};

// Helper function to update or create meta tags
const updateMetaTag = (
  attribute: string,
  value: string,
  content: string,
): void => {
  if (!content) return;

  let metaTag = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, value);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute("content", content);
};
