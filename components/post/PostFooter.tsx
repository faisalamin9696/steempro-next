import PostFooterMobile from "./PostFooterMobile";
import PostFooterDesktop from "./PostFooterDesktop";

function PostFooter({
  comment,
  isMobile,
  isDetail,
}: {
  comment: Feed | Post;
  isMobile?: boolean;
  isDetail?: boolean;
}) {
  if (isMobile)
    return <PostFooterMobile comment={comment} isDetail={isDetail} />;

  return <PostFooterDesktop comment={comment} />;
}

export default PostFooter;
