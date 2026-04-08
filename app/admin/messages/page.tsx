import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

import { MessagesInbox } from "./messages-inbox";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Messages Inbox</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Review inbound conversations in one clean studio inbox.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              This inbox keeps recruiter outreach, collaboration notes, and reply
              drafts structured in the same editorial admin system as the rest of the workspace.
            </p>
          </div>
          <Link href="/" className="button-link">
            View Portfolio
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EditorialCard className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Layout
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Inbox + Detail
          </p>
        </EditorialCard>
        <EditorialCard accent="blue" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Actions
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Read, archive, reply
          </p>
        </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Data Mode
          </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Local Data
              </p>
            </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Inbox Management</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Keep follow-up decisions readable without collapsing into a generic mail app.
        </h2>
      </div>

      <MessagesInbox />
    </div>
  );
}
