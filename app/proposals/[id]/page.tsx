import { auth } from "@/auth";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import ProposalPage from "./(site)/ProposalPage";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const proposal = await sdsApi.getProposal(parseInt(id));
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
