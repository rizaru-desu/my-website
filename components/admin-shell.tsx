"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { profile } from "@/lib/mock-content";
import { cn } from "@/lib/utils";

type AdminLink = {
  href: string;
  label: string;
  short: string;
  compactLabel: string;
  architectOnly?: boolean;
};

const adminLinks = [
  { href: "/admin", label: "Dashboard", short: "01", compactLabel: "DASH" },
  {
    href: "/admin/profile",
    label: "Profile",
    short: "02",
    compactLabel: "PROF",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    short: "03",
    compactLabel: "PROJ",
  },
  {
    href: "/admin/skills",
    label: "Skills",
    short: "04",
    compactLabel: "SKILLS",
  },
  { href: "/admin/blog", label: "Blog", short: "05", compactLabel: "BLOG" },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    short: "06",
    compactLabel: "TESTI",
  },
  {
    href: "/admin/messages",
    label: "Messages",
    short: "07",
    compactLabel: "MSGS",
  },
  {
    href: "/admin/resume",
    label: "Resume",
    short: "08",
    compactLabel: "RESUME",
  },
  {
    href: "/admin/account",
    label: "Account",
    short: "09",
    compactLabel: "ACCT",
  },
  {
    href: "/admin/users",
    label: "Users",
    short: "10",
    compactLabel: "USERS",
    architectOnly: true,
  },
] satisfies AdminLink[];

type AdminShellProps = {
  children: ReactNode;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function formatRoleLabel(role: string | null | undefined) {
  if (!role) {
    return "Member";
  }

  return role
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getUserInitials(name: string | null | undefined, email: string | null | undefined) {
  const label = name?.trim() || email?.split("@")[0] || "User";
  const parts = label.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function PublicProfileCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Card accent="cream" className="space-y-4">
      <CardContent className="space-y-4 ">
        <div className="flex items-start gap-4 text-neutral-700">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] border-[3px] border-panel bg-accent-red font-display text-2xl uppercase text-white shadow-[5px_5px_0_var(--panel)]">
            RA
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Public Profile
            </p>
            <CardTitle className="text-black">{profile.name}</CardTitle>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-700">
              {profile.role}
            </p>
          </div>
        </div>
        <div className="rounded-[20px] border-[3px] border-ink/15 bg-white/65 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Public Portfolio
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Jump back to the public-facing site to review the live editorial
            presentation of your profile and content.
          </p>
        </div>
        <Button asChild className="mt-1 w-full">
          <Link href="/" onClick={onNavigate}>
            View Portfolio
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingBlock({
  className,
  rounded = "rounded-full",
}: {
  className: string;
  rounded?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-ink/12", rounded, className)}
    />
  );
}

function AdminNavSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`admin-nav-skeleton-${index}`}
          className="rounded-[26px] border-[3px] border-ink bg-white/55 px-5 py-4 shadow-[4px_4px_0_var(--ink)]"
        >
          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_3.75rem] items-center gap-4">
            <LoadingBlock className="h-3 w-8" />
            <LoadingBlock
              className={cn(
                "h-6",
                index % 2 === 0 ? "w-28" : "w-36",
              )}
            />
            <LoadingBlock className="ml-auto h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionIdentitySkeleton() {
  return (
    <div className="min-w-[240px] rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
      <div className="flex items-center gap-3">
        <LoadingBlock className="h-12 w-12 rounded-[16px]" rounded="" />
        <div className="min-w-0 flex-1 space-y-2">
          <LoadingBlock className="h-3 w-20" />
          <LoadingBlock className="h-6 w-32" />
          <LoadingBlock className="h-4 w-40 max-w-full" />
        </div>
      </div>
      <LoadingBlock className="mt-3 h-3 w-24" />
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const currentUser = isSessionPending
    ? null
    : ((session?.user as SessionUser | undefined) ?? null);
  const currentUserRole = currentUser?.role ?? null;
  const currentUserName = currentUser?.name?.trim() || "Workspace User";
  const currentUserEmail = currentUser?.email?.trim() || "No email available";
  const currentUserInitials = getUserInitials(currentUser?.name, currentUser?.email);
  const isArchitect = currentUserRole === "architect";
  const visibleAdminLinks = isSessionPending
    ? []
    : adminLinks.filter((link) => !link.architectOnly || isArchitect);
  const currentAdminLink =
    adminLinks.find(
      (link) =>
        pathname === link.href ||
        (link.href !== "/admin" && pathname.startsWith(link.href)),
    ) ?? adminLinks[0];

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsMobileNavOpen(false);
            router.push("/login");
          },
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen px-4 pb-6 pt-4 sm:px-6">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="paper-grid hidden rounded-[28px] border-[3px] border-ink bg-panel p-6 shadow-[8px_8px_0_var(--ink)] xl:block">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="section-label">Workspace</span>
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/65">
                    Portfolio Control Room
                  </p>
                  <h1 className="font-display text-5xl uppercase leading-[0.9] text-ink">
                    Edit fast. Publish bold.
                  </h1>
                  <p className="text-sm leading-7 text-ink/75">
                    A content workspace for shaping the public portfolio without
                    falling back into a generic dashboard look.
                  </p>
                </div>
              </div>

              <Separator />

              <nav className="space-y-4">
                {isSessionPending ? (
                  <AdminNavSkeleton />
                ) : (
                  visibleAdminLinks.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/admin" && pathname.startsWith(link.href));

                    return (
                      <Button
                        key={link.href}
                        asChild
                        variant={isActive ? "blue" : "muted"}
                        className="flex w-full items-center justify-between rounded-[26px] px-5 py-4 text-left shadow-[4px_4px_0_var(--ink)] hover:shadow-[5px_5px_0_var(--ink)]"
                      >
                        <Link href={link.href}>
                          <span className="grid min-w-0 flex-1 grid-cols-[2.25rem_minmax(0,1fr)_3.75rem] items-center gap-4">
                            <span
                              className={`text-left text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${
                                isActive ? "text-white/72" : "text-ink/52"
                              }`}
                            >
                              {link.short}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  tabIndex={0}
                                  className="min-w-0 text-center font-display text-[1.45rem] leading-none tracking-tight outline-none"
                                >
                                  {link.compactLabel}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{link.label}</TooltipContent>
                            </Tooltip>
                            <span
                              className={`text-right text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                                isActive ? "text-white/80" : "text-ink/58"
                              }`}
                            >
                              OPEN
                            </span>
                          </span>
                        </Link>
                      </Button>
                    );
                  })
                )}
              </nav>

              {!isSessionPending && isArchitect ? <PublicProfileCard /> : null}
            </div>
          </aside>

          <div className="space-y-6">
            <Card className="relative overflow-hidden px-5 py-4">
              <div className="accent-plate right-6 top-5 hidden h-12 w-24 rotate-3 rounded-full bg-accent-red md:block" />
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
                    Editorial Admin Interface
                  </p>
                  <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
                    Portfolio and workspace in one bold system.
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isSessionPending ? (
                    <SessionIdentitySkeleton />
                  ) : (
                    <div className="min-w-[240px] rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border-[3px] border-panel bg-accent-blue font-display text-lg uppercase text-white shadow-[4px_4px_0_var(--panel)]">
                          {currentUserInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink/55">
                            Signed In
                          </p>
                          <p className="truncate font-display text-2xl uppercase leading-none text-ink">
                            {currentUserName}
                          </p>
                          <p className="mt-1 truncate text-sm text-ink/68">
                            {currentUserEmail}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink/58">
                        Role: {formatRoleLabel(currentUserRole)}
                      </p>
                    </div>
                  )}
                  <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                    <SheetTrigger
                      className="xl:hidden"
                      size="sm"
                      variant="default"
                      aria-label="Open workspace navigation"
                      disabled={isSessionPending}
                    >
                      Menu
                    </SheetTrigger>
                    <SheetContent className="overflow-hidden p-0" side="left">
                      <div className="themed-scrollbar flex h-full flex-col overflow-y-auto p-5 pr-2">
                        <div className="space-y-6">
                          <SheetHeader>
                            <span className="section-label">Workspace</span>
                            <SheetTitle>Navigate the control room.</SheetTitle>
                            <SheetDescription>
                              Use the menu to jump between sections on smaller
                              screens without keeping the full sidebar open.
                            </SheetDescription>
                          </SheetHeader>

                          <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/55">
                              Current section
                            </p>
                            <p className="mt-2 font-display text-3xl uppercase leading-none text-ink">
                              {currentAdminLink.label}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {isSessionPending ? (
                              <AdminNavSkeleton />
                            ) : (
                              visibleAdminLinks.map((link) => {
                                const isActive =
                                  pathname === link.href ||
                                  (link.href !== "/admin" &&
                                    pathname.startsWith(link.href));

                                return (
                                  <Button
                                    key={link.href}
                                    asChild
                                    variant={isActive ? "blue" : "muted"}
                                    className="flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left"
                                  >
                                    <Link
                                      href={link.href}
                                      onClick={() => setIsMobileNavOpen(false)}
                                    >
                                      <span className="grid min-w-0 flex-1 grid-cols-[2.25rem_minmax(0,1fr)_3.75rem] items-center gap-3">
                                        <span
                                          className={`text-left text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${
                                            isActive ? "text-white/72" : "text-ink/52"
                                          }`}
                                        >
                                          {link.short}
                                        </span>
                                        <span className="min-w-0 text-left font-display text-[1.35rem] leading-none tracking-tight">
                                          {link.label}
                                        </span>
                                        <span
                                          className={`text-right text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                                            isActive ? "text-white/80" : "text-ink/58"
                                          }`}
                                        >
                                          OPEN
                                        </span>
                                      </span>
                                    </Link>
                                  </Button>
                                );
                              })
                            )}
                          </div>

                          {!isSessionPending && isArchitect ? (
                            <PublicProfileCard
                              onNavigate={() => setIsMobileNavOpen(false)}
                            />
                          ) : null}
                        </div>

                        <SheetFooter className="mt-auto pt-6">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full justify-between"
                          >
                            <Link href="/" onClick={() => setIsMobileNavOpen(false)}>
                              View Portfolio
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ink"
                            className="w-full justify-between"
                            onClick={handleSignOut}
                            disabled={isSigningOut || isSessionPending}
                          >
                            {isSessionPending
                              ? "Syncing Session..."
                              : isSigningOut
                                ? "Signing Out..."
                                : "Logout"}
                          </Button>
                        </SheetFooter>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <span className="sticker-chip sticker-chip-blue xl:hidden">
                    {isSessionPending ? "SYNC" : currentAdminLink.compactLabel}
                  </span>
                  {isSessionPending ? (
                    <Button size="sm" variant="muted" className="hidden sm:inline-flex" disabled>
                      Syncing Routes
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        size="sm"
                        variant="muted"
                        className="hidden sm:inline-flex"
                      >
                        Quick Jump
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Workspace Routes</DropdownMenuLabel>
                        {visibleAdminLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/">Public Homepage</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ink"
                    onClick={handleSignOut}
                    disabled={isSigningOut || isSessionPending}
                    className="ml-auto sm:ml-0"
                  >
                    {isSessionPending
                      ? "Syncing Session..."
                      : isSigningOut
                        ? "Signing Out..."
                        : "Logout"}
                  </Button>
                </div>
              </div>
            </Card>

            <main>{children}</main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
