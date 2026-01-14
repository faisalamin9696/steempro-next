import moment from "moment";
import Link from "next/link";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { CornerDownRight, Link2 } from "lucide-react";
import PostLink from "../post/PostLink";

function CommentHeader({ comment }: { comment: Post | Feed }) {
  return (
    <>
      <div className="hidden sm:flex items-center gap-2 mb-1 flex-wrap text-sm">
        <SUsername
          username={`@${comment.author}`}
          className="font-semibold hover:text-primary"
        />
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
      </div>

      <div className="flex sm:hidden flex-row gap-2 items-center">
        <SAvatar size={"xs"} username={comment.author} />
        {/* Username + Time */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <SUsername username={comment.author} className="text-sm" />

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
        </div>
      </div>
    </>
  );
}

export default CommentHeader;
