import { auth } from "@/auth";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import WitnessesPage from "./(site)/WitnessesPage";

async function page() {
  const session = await auth();
  const data = mapSds<Witness[]>(
    await sds.witnesses.getWitnessesByRank({
      observer: session?.user?.name ?? "steem",
      limit: 200,
      offset: 0,
    }),
  );

  return <WitnessesPage data={data} />;
}

export default page;
