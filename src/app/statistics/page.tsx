import { StatisticsPortal } from "@/components/statistics-portal";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function StatisticsPage() {
  const initialAuthUser = await getInitialAuthUser();

  return <StatisticsPortal initialAuthUser={initialAuthUser} />;
}
