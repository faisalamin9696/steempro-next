import Image from "next/image";
import type { TwitterComponents } from "react-tweet";

export const tweet_components: TwitterComponents = {
  AvatarImg: (props) => <Image {...props} className="mt-0!" />,
  MediaImg: (props) => <Image {...props} fill unoptimized />,
};
