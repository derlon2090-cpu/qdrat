import { PaperModelsPortal } from "@/components/paper-models-portal";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function PaperModelsPage() {
  const initialAuthUser = await getInitialAuthUser();

  return <PaperModelsPortal initialAuthUser={initialAuthUser} />;
}
