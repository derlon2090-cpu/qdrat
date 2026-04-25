import { SummaryCenterPortal } from "@/components/summary-center-portal";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function SummariesPage() {
  const initialAuthUser = await getInitialAuthUser();

  return <SummaryCenterPortal initialAuthUser={initialAuthUser} />;
}
