import { redirect } from "next/navigation";

import { AccountPortal } from "@/components/account-portal";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function AccountPage() {
  const initialAuthUser = await getInitialAuthUser();

  if (!initialAuthUser) {
    redirect("/login?next=/account");
  }

  return <AccountPortal initialAuthUser={initialAuthUser} />;
}
