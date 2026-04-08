import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { UsersManagement } from "@/app/admin/users/users-management";
import { managedUsersQueryKey } from "@/app/admin/users/users-management.queries";
import { auth } from "@/lib/auth";
import { getManagedUsers } from "@/lib/admin-users";

export default async function AdminUsersPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    redirect("/login?redirectTo=%2Fadmin%2Fusers");
  }

  if (session.user.role !== "architect") {
    redirect("/admin");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: managedUsersQueryKey,
    queryFn: () =>
      getManagedUsers({
        currentUserId: session.user.id,
        headers: requestHeaders,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8">
        <section className="surface-panel relative overflow-hidden bg-panel px-6 py-8 sm:px-8">
          <div className="accent-plate left-8 top-8 hidden h-14 w-14 -rotate-6 rounded-[18px] bg-accent-red lg:block" />
          <div className="accent-plate bottom-8 right-10 hidden h-12 w-28 rotate-3 rounded-full bg-accent-blue lg:block" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <Badge variant="red">Architect Only</Badge>
              <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
                Control who can still enter the studio.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-ink/78 sm:text-lg">
                User Management gives the architect role a single place to inspect
                account status, spot inactive users, ban access when needed, and
                revoke live sessions without leaving the admin shell.
              </p>
            </div>
            <div className="rounded-[24px] border-[3px] border-ink bg-white/75 px-5 py-4 shadow-[6px_6px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                Scope
              </p>
              <p className="mt-2 font-display text-3xl uppercase leading-none text-ink">
                BAN + REVOKE
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-ink/72">
                Inactive status is derived from active session count, so revoking
                sessions immediately moves a user into the inactive state.
              </p>
            </div>
          </div>
        </section>

        <UsersManagement />
      </div>
    </HydrationBoundary>
  );
}
