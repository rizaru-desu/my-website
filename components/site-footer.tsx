"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SocialLinkIcon } from "@/components/social-link-icon";
import { formatAppVersionLabel, getAppVersionInfo } from "@/lib/app-version";
import { usePublicProfile } from "@/lib/profile-client";

export function SiteFooter() {
  const version = getAppVersionInfo();
  const profile = usePublicProfile();

  return (
    <footer className="px-4 pb-10 pt-16 sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-[32px] border-[3px] border-ink bg-ink px-6 py-8 text-panel shadow-[8px_8px_0_var(--accent-red)] md:grid-cols-[1.2fr_auto_0.8fr] md:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-panel/70">
            Portfolio Platform
          </p>
          <h2 className="font-display text-3xl uppercase leading-none sm:text-4xl">
            Built to feel memorable, but easy to hire from.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-panel/80 sm:text-base">
            This experience brings the public portfolio and the internal
            workspace into one bold system with a consistent editorial voice.
          </p>
          <div className="inline-flex w-fit items-center rounded-full border border-panel/25 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-panel/72">
            Release {formatAppVersionLabel(version)}
          </div>
          <Dialog>
            <DialogTrigger variant="blue" size="sm">
              Design Notes
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Interface Notes</DialogTitle>
                <DialogDescription>
                  The interface uses shared primitives and custom theme tokens
                  to keep the editorial look consistent across every route.
                </DialogDescription>
              </DialogHeader>
              <Separator className="my-5" />
              <div className="space-y-3 text-sm leading-7 text-ink/75">
                <p>Public pages remain more expressive and poster-like.</p>
                <p>
                  Internal surfaces stay tighter and more structured without
                  feeling generic.
                </p>
                <p>Navigation, hierarchy, and content presentation stay aligned.</p>
              </div>
              <DialogFooter>
                <DialogClose>Close</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator
          orientation="vertical"
          className="hidden h-full border-panel/25 md:block"
        />
        <div className="space-y-4 md:justify-self-end">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-panel/70">
            Reach Out
          </p>
          <div className="flex flex-wrap gap-3">
            {profile.socialLinks.map((link) => (
              <Button key={link.label} asChild variant="default" size="sm">
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <SocialLinkIcon href={link.href} label={link.label} />
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
          <p className="text-sm text-panel/70">{profile.email}</p>
          <a
            href="/api/version"
            className="inline-flex w-fit text-xs font-semibold uppercase tracking-[0.22em] text-panel/58 underline decoration-panel/25 underline-offset-4 transition hover:text-panel/82"
          >
            Runtime Version
          </a>
        </div>
      </div>
    </footer>
  );
}
