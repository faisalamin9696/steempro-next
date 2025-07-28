import React from "react";
import InfiniteScroll from "./InfiniteScroll";
import { fetchSds } from "@/constants/AppFunctions";
import CommentCard from "./comment/CommentCard";
import { FeedPerPage } from "@/constants/AppConstants";
import { ScrollToTopButton } from "./ScrollToTopButton";

interface Props {
  isCommunity?: boolean;
  dataKey: (
    pageIndex: number,
    previousPageData: Feed[] | null
  ) => string | null;
}
function FeedList(props: Props) {
  const { dataKey, isCommunity } = props;
  return (
    <div>
      <InfiniteScroll<Feed>
        getKey={dataKey}
        fetcher={fetchSds}
        keyExtractor={(comment) => comment.link_id?.toString() || ""}
        renderItem={(comment) => (
          <CommentCard
            isCommunity={isCommunity}
            key={comment.link_id}
            comment={comment}
          />
        )}
        pageSize={FeedPerPage} // Make sure this matches your API's page size
      />
      <ScrollToTopButton />
      
    </div>
  );
}

export default FeedList;
