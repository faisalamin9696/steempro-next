import { auth } from "@/auth";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getProposal } from "@/libs/steem";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import ProposalPage from "./(site)/ProposalPage";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const proposal = await getProposal(parseInt(id));
  const post = mapSds<Post>(
    await sds.posts.getPost({
      author: proposal.creator,
      permlink: proposal.permlink,
      withVotes: true,
      observer: session?.user?.name ?? "steem",
    }),
  );
  return (
    <MainWrapper>
      <ProposalPage data={proposal} post={post} />
    </MainWrapper>
  );
}

export default page;
