import { getInitialAuthUser } from "@/lib/server-auth";
import { ExamPageClient } from "@/components/exam-page-client";

export default async function ExamPage() {
  const initialAuthUser = await getInitialAuthUser();

  return <ExamPageClient initialAuthUser={initialAuthUser} />;
}
