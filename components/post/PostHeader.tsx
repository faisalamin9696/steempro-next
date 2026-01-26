import moment from "moment";
import Link from "next/link";
import Reputation from "./Reputation";
import { Chip } from "@heroui/chip";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import PostOptionButton from "./PostOptionButton";
import { Pin } from "lucide-react";
import TranslateButton from "../TranslateButton";
import { Image } from "@heroui/image";
import { parsePostMeta } from "@/utils/user";
import { getAppDetails } from "@/utils/app";

interface Props {
  comment: Feed | Post;
  onEditPress?: () => void;
  isDetail?: boolean;
  // Translation props
  showTranslate?: boolean;
  onTranslate?: (translatedText: string, language: string) => void;
  onResetTranslation?: () => void;
  isTranslated?: boolean;
  currentLanguage?: string;
}

function PostHeader({
  comment,
  onEditPress,
  isDetail,
  showTranslate = false,
  onTranslate,
  onResetTranslation,
  isTranslated = false,
  currentLanguage,
}: Props) {
  const {
    author,
    author_reputation,
    author_role,
    author_title,
    category,
    community,
    created,
    last_update,
    json_metadata,
  } = comment;

  const { app } = parsePostMeta(json_metadata);
  const {
    name: appName,
    icon: appIcon,
    website: appWebsite,
  } = getAppDetails(app);

  const communityName = community || category;

  return (
    <div className="flex gap-2 items-center w-full">
      <SAvatar username={author} size={48} />

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex gap-2 items-start flex-1">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <span className="font-normal">
              <SUsername username={author} />
            </span>
            <Reputation value={author_reputation} />

            {author_role && (
              <span className="uppercase text-xs text-[0.6rem] text-muted">
                {author_role}
              </span>
            )}

            {author_title && (
              <Chip
                size="sm"
                variant="flat"
                className="min-w-0 h-5 items-center p-0 px-1 text-muted"
              >
                {author_title}
              </Chip>
            )}
          </div>

          <div className="flex flex-row gap-2 items-center">
            {appName && appIcon && (
              <div className=" opacity-80">
                <Link href={appWebsite} target="_blank">
                  <Image
                    title={`Posted via ${appName}`}
                    src={appIcon}
                    alt={appName}
                    width={14}
                    height={14}
                    className="min-w-[14px] rounded-full"
                    removeWrapper
                  />
                </Link>
              </div>
            )}
            <PostOptionButton
              comment={comment}
              size="sm"
              isIconOnly
              radius="md"
              className="min-h-0 h-6"
              placement="bottom-start"
              onEditPress={onEditPress}
              isDetail={isDetail}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex flex-row gap-2">
            <span className="text-muted">in</span>
            <Link
              href={`/trending/${category}`}
              className="font-semibold hover:underline text-default-900"
            >
              {communityName}
            </Link>
          </span>
          <span
            title={moment.unix(created).toLocaleString()}
            className="flex flex-row gap-2 items-center text-muted"
          >
            • {moment.unix(created).fromNow()}
            {!!comment.is_pinned && (
              <Pin size={16} className="text-muted rotate-45" />
            )}
          </span>
          {isDetail && created !== last_update && (
            <p
              title={moment.unix(last_update).toLocaleString()}
              className="text-muted"
            >
              (edited)
            </p>
          )}

          {showTranslate && onTranslate && onResetTranslation && (
            <TranslateButton
              originalText={comment.body}
              onTranslate={onTranslate}
              onReset={onResetTranslation}
              isTranslated={isTranslated}
              currentLanguage={currentLanguage}
              size="sm"
              variant="light"
              className="text-default-800"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PostHeader;
