import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import WitnessesPage from "./(site)/WitnessesPage";

async function page() {
  const session = await auth();
  const data = await sdsApi.getWitnessesByRank(session?.user?.name, 200);

  return <WitnessesPage data={data} />;
}

export default page;
