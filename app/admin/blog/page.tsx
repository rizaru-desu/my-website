import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { AdminBlogAccessError, getAdminBlogContext } from "@/lib/blog";
import { BlogsCms } from "./blogs-cms";

export default async function AdminBlogPage() {
  const requestHeaders = await headers();
  let context: Awaited<ReturnType<typeof getAdminBlogContext>>;

  try {
    context = await getAdminBlogContext(requestHeaders);
  } catch (error) {
    if (error instanceof AdminBlogAccessError && error.status === 401) {
      redirect("/login?redirectTo=%2Fadmin%2Fblog");
    }

    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Blog Manager</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Editorial planning with strong hierarchy.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              The blog manager keeps article tone, tags, featured placement, and
              release rhythm visible at a glance without turning into a bland table.
            </p>
          </div>
          <Link href="/blog" className="button-link">
            View Public Blog
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EditorialCard className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Editor Foundation
          </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Structured Validation
              </p>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Listing Layer
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Search and Pagination
              </p>
            </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Editor Container
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Resizable Story Drawer
          </p>
        </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Editorial Management</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Build the issue board, tune story metadata, and publish from one clean surface.
        </h2>
      </div>

      <BlogsCms
        currentUserName={context.currentUserName}
        permissions={context.permissions}
      />
    </div>
  );
}
