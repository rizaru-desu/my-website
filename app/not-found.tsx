import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

export default function NotFound() {
  return (
    <div className="px-4 pb-6 pt-12 sm:px-6 sm:pt-16">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center">
        <EditorialCard accent="red" className="w-full overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div className="space-y-4">
              <Badge variant="red">404</Badge>
              <h1 className="font-display text-6xl uppercase leading-none text-ink sm:text-7xl">
                Lost the page.
              </h1>
            </div>
            <div className="space-y-5">
              <p className="max-w-2xl text-base leading-8 text-ink/80 sm:text-lg">
                The route you opened does not exist here. Jump back into the
                homepage, project archive, or resume route to keep exploring.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/" className="button-link">
                  Home
                </Link>
                <Link href="/projects" className="button-link button-link-blue">
                  Projects
                </Link>
                <Link href="/resume" className="button-link button-link-muted">
                  Resume
                </Link>
              </div>
            </div>
          </div>
        </EditorialCard>
      </div>
    </div>
  );
}
