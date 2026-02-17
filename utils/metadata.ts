import { extractBodySummary } from "./extractContent";
import { ResolvingMetadata } from "next";
import { getResizedAvatar, getThumbnail } from "./image";
import { sdsApi } from "@/libs/sds";

const DEFAULT_DESCRIPTION =
  "SteemPro is a decentralized social media platform powered by the Steem blockchain. Explore trending discussions, join vibrant communities, and share your unique perspective.";

const DEFAULT_IMAGE = "https://www.steempro.com/opengraph-image.jpg";

export const getMetadata = {
  home: (category: string) => {
    category = category?.toLowerCase();
    if (!category) category = "trending";
    const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `${capCat} topics`;
    const pageDescription = `Explore ${category} discussions on a user-owned social network. ${capCat} topics cover a wide range of interests and perspectives, providing valuable insights and lively conversations.`;
    const url =
      category === "trending"
        ? "https://www.steempro.com"
        : `https://www.steempro.com/${category}`;

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  profileAsync: async (username: string, tab: string) => {
    username = username?.toLowerCase();
    tab = tab?.toLowerCase() || "blog";

    const result = await sdsApi.getAccountExt(username);
    const { name, about } =
      JSON.parse(result.posting_json_metadata || "{}")?.profile ?? {};
    const capTab = tab.charAt(0).toUpperCase() + tab.slice(1);
    const pageTitle = !!name
      ? `${name} (@${username}) - ${capTab} on the Decentralized Web`
      : `@${username} - ${capTab} on the Decentralized Web`;
    const pageDescription = about || DEFAULT_DESCRIPTION;
    const url = `https://www.steempro.com/@${username}`;
    const image = getResizedAvatar(username, "large");

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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [image],
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
    const url = `https://www.steempro.com/@${username}`;
    const image = getResizedAvatar(username, "large");

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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [image],
      },
    };
  },
  category: (category: string, tag: string) => {
    category = category?.toLowerCase();
    tag = tag?.toLowerCase();
    // const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `Latest #${tag} ${category} topics on the Internet`;
    const pageDescription = `Explore the latest ${category} discussions and topics related to #${tag} on the internet. Stay updated with the most recent conversations and insights.`;
    const url = `https://www.steempro.com/${category}/${tag}`;

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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  communities: () => {
    const pageTitle = `Communities on SteemPro - Join Engaging Discussions`;
    const pageDescription = `Explore diverse communities on SteemPro, a user-owned social network. Join engaging discussions, share your passions, and connect with like-minded individuals.`;
    const url = "https://www.steempro.com/communities";

    return {
      title: pageTitle,
      description: pageDescription,
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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  market: () => {
    const pageTitle = `SteemPro Market – Buy, Sell, and Discover Digital Assets on the Steem Blockchain`;
    const pageDescription = `Explore the SteemPro Market – a decentralized marketplace to trade digital assets, tokens, NFTs, and services on the Steem blockchain. Fast, secure, and user-driven.`;
    const url = "https://www.steempro.com/market";

    return {
      title: pageTitle,
      description: pageDescription,
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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
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
    const url = `https://www.steempro.com/@${author}/${permlink}`;

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
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [thumbnail || DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [thumbnail || DEFAULT_IMAGE],
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

    const [parentData, result] = await Promise.all([
      parent,
      sdsApi.getCommunity(community),
    ]);

    const previousImages = parentData?.openGraph?.images || [];
    const { title, about } = result ?? {};
    const pageTitle = title
      ? `${title} - ${category} in the ${community} Community`
      : `${community} Community ${category} List`;
    const pageDescription = about || DEFAULT_DESCRIPTION;
    const url = `https://www.steempro.com/community/${category}/${tag}`;
    const image = result?.account
      ? getResizedAvatar(result.account, "medium")
      : DEFAULT_IMAGE;

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
      images: result?.account
        ? [getResizedAvatar(result.account, "medium"), ...previousImages]
        : previousImages,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [image],
      },
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
    const pageTitle =
      "SteemPro Proposals - Fund and Support Community Projects";
    const pageDescription =
      "Explore and support community-driven projects on SteemPro. Vote for proposals that enhance the Steem ecosystem and help shape the future of decentralized social media.";
    const url = "https://www.steempro.com/proposals";

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },

  proposalAsync: async (id: string) => {
    try {
      const proposal = await sdsApi.getProposal(Number(id));
      if (proposal) {
        // Optimization: Use subject from proposal if possible,
        // fallback to fetching post for full details and thumbnail
        const pageTitle = proposal.subject;
        const pageDescription = pageTitle + ` proposal by @${proposal.creator}`;
        const url = `https://www.steempro.com/proposals/${id}`;
        const image = getResizedAvatar(proposal.creator, "medium");

        // Return immediately if we can, or fetch post in background/parallel if thumbnail is needed
        // For now, let's keep it simple but avoid unnecessary chaining if we have enough info
        return {
          title: pageTitle,
          description: pageDescription,
          // Use creator avatar as fallback thumbnail to avoid another roundtrip
          thumbnail: image,
          openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: url,
            images: [image],
          },
          twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: pageDescription,
            images: [image],
          },
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
    const pageTitle = "Scheduled posts";
    const pageDescription =
      "Manage your scheduled posts easily with SteemPro. View, edit, and delete scheduled posts in one place. Stay organized and keep your content strategy on track.";
    const url = "https://www.steempro.com/schedules";

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: "SteemPro, schedule posts, scheduling",
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  settings: () => {
    const pageTitle = `Settings - Customize Your SteemPro Experience`;
    const pageDescription = `Explore the settings page on SteemPro to personalize and optimize your experience on the Steem blockchain. Customize your preferences, security settings, notifications, and more to tailor SteemPro to your needs and preferences.`;
    const url = "https://www.steempro.com/settings";

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  submit: () => {
    const pageTitle = `Create and Submit - Share Your Ideas with the World!`;
    const pageDescription = `Submit your posts, articles, and content to SteemPro and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`;
    const url = "https://www.steempro.com/submit";

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
      title: pageTitle,
      description: pageDescription,
      keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  tools: () => {
    const pageTitle = `SteemPro Tools - Enhancing Your Steem Experience`;
    const pageDescription = `Discover a suite of powerful tools tailored for Steem users, designed to streamline your interactions, boost efficiency, and elevate your Steem experience to new heights.`;
    const url = "https://www.steempro.com/tools";

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
      title: pageTitle,
      description: pageDescription,
      keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  witnesses: () => {
    const pageTitle = `Steem Blockchain Witnesses: Trusted Block Producers`;
    const pageDescription = `Discover the trusted witnesses (block producers) contributing to the security and governance of the Steem blockchain. Learn about their role and contributions.`;
    const url = "https://www.steempro.com/witnesses";

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
      title: pageTitle,
      description: pageDescription,
      keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  games: () => {
    const pageTitle = "Mini Games by SteemPro - Play and Earn on Steem";
    const pageDescription =
      "Explore a collection of mini games by SteemPro. Play, compete, and earn rewards on the Steem blockchain. Experience decentralized gaming with proof of skill.";
    const url = "https://www.steempro.com/games";

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: [
        "SteemPro mini games",
        "blockchain games",
        "play to earn Steem",
        "decentralized gaming",
        "Steem Heights",
        "skill-based games",
        "crypto rewards gaming",
      ],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  steemHeights: () => {
    const pageTitle =
      "Steem Heights - The Ultimate Scaling Challenge by SteemPro";
    const pageDescription =
      "Test your focus and precision in Steem Heights. Scale the skyline, reach new altitudes, and secure your place on the blockchain leaderboard. Win Steem rewards!";
    const url = "https://www.steempro.com/games/steem-heights";

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: [
        "Steem Heights game",
        "scaling challenge",
        "precision game",
        "Steem rewards game",
        "blockchain leaderboard",
        "SteemPro gaming",
        "stacking blocks game",
      ],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  about: () => {
    const pageTitle = `About SteemPro - Empowering Your Steem Experience`;
    const pageDescription = `Learn more about SteemPro, the leading platform dedicated to providing valuable insights, resources, and community engagement opportunities for Steem enthusiasts. Discover our mission, vision, and commitment to empowering your journey on the Steem blockchain.`;
    const url = "https://www.steempro.com/about";

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: [
        "SteemPro platform",
        "Steem blockchain insights",
        "SteemPro community",
        "Steem resources",
        "SteemPro mission",
        "SteemPro vision",
        "empower Steem experience",
        "Steem blockchain platform",
        "SteemPro engagement",
        "Steem enthusiasts",
      ].join(", "),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
      },
    };
  },
  privacyPolicy: () => {
    const pageTitle = "Privacy Policy - SteemPro";
    const pageDescription =
      "Learn how SteemPro protects your data, manages your security keys, and maintains your privacy on the Steem blockchain. Your security and privacy are our top priorities.";
    const url = "https://www.steempro.com/privacy-policy";

    return {
      title: "Privacy Policy",
      description: pageDescription,
      keywords:
        "privacy policy SteemPro, privacy and policy, key management, security",
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: url,
        images: [DEFAULT_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [DEFAULT_IMAGE],
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
