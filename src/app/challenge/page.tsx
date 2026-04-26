import { redirect } from "next/navigation";

import { ChallengePortal } from "@/components/challenge-portal";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function ChallengePage() {
  const initialAuthUser = await getInitialAuthUser();

  if (!initialAuthUser) {
    redirect("/login?next=/challenge");
  }

  return <ChallengePortal initialAuthUser={initialAuthUser} />;
}
