import moment from "moment";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { CornerDownRight, Link2, TriangleAlert } from "lucide-react";
import PostLink from "../post/PostLink";
import Reputation from "../post/Reputation";
import TranslateButton from "../TranslateButton";

interface CommentHeaderProps {
  comment: Post | Feed;
  // Translation props
  showTranslate?: boolean;
  onTranslate?: (translatedText: string, language: string) => void;
  onResetTranslation?: () => void;
  isTranslated?: boolean;
  currentLanguage?: string;
}

function CommentHeader({
  comment,
  showTranslate = false,
  onTranslate,
  onResetTranslation,
  isTranslated = false,
  currentLanguage,
}: CommentHeaderProps) {
  const isLowQuality =
    Boolean(comment.is_muted) || comment.author_role === "muted";

  return (
    <>
      <div className="hidden sm:flex items-center gap-2 mb-1 flex-wrap text-sm">
        <SUsername
          username={`@${comment.author}`}
          className="font-semibold hover:text-primary"
        />
        <Reputation value={comment.author_reputation} />

        {isLowQuality && (
          <span title="Marked as low quality">
            <TriangleAlert className="text-warning" size={14} />
          </span>
        )}

        <span className="text-xs text-muted">
          • {moment.unix(comment.created).fromNow()}
        </span>
        {comment.created !== comment.last_update && (
          <p
            title={moment.unix(comment.last_update).toLocaleString()}
            className="text-muted"
          >
            (edited)
          </p>
        )}
        <PostLink
          className="text-default-800"
          comment={comment}
          title={<Link2 size={16} />}
        />

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

      <div className="flex sm:hidden flex-row gap-2 items-center">
        <SAvatar size={"xs"} username={comment.author} />
        {/* Username + Time */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <SUsername username={comment.author} className="text-sm" />

          <Reputation value={comment.author_reputation} />

          <span className="text-xs text-muted">
            • {moment.unix(comment.created).fromNow()}
          </span>

          {(comment.depth ?? 0) > 1 && comment.parent_author && (
            <span className="text-xs text-muted">
              <CornerDownRight size={12} className="inline" /> @
              {comment.parent_author}
            </span>
          )}
          <PostLink
            className="text-default-800"
            comment={comment}
            title={<Link2 size={16} />}
          />

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
    </>
  );
}

export default CommentHeader;
