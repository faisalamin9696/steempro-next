import { auth } from "@/auth";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { proposalOr404 } from "@/libs/sds-server";
import ProposalPage from "./(site)/ProposalPage";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The layout already validated the shape and existence (and 404s before the
  // response starts); this call is request-cached, so it is the same RPC.
  const proposal = await proposalOr404(Number(id));

  const session = await auth();
  const post = await sdsApi.getPost(
    proposal.creator,
    proposal.permlink,
    session?.user?.name,
  );

  return (
    <MainWrapper>
      <ProposalPage data={proposal} post={post} />
    </MainWrapper>
  );
}

export default page;
