"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
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

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[28px] border-[3px] border-ink bg-panel/95 px-4 py-3 shadow-[6px_6px_0_var(--ink)] backdrop-blur sm:px-6">
          <Tooltip>
            <TooltipTrigger>
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-ink bg-accent-red font-display text-xl uppercase text-white shadow-[4px_4px_0_var(--ink)]">
                  RA
                </span>
                <div>
                  <p className="font-display text-lg uppercase leading-none text-ink">
                    Rizal Achmad
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink/65">
                    Product Engineer
                  </p>
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Portfolio home</TooltipContent>
          </Tooltip>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex flex-wrap items-center justify-end gap-2">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Button
                    key={link.href}
                    asChild
                    variant={isActive ? "blue" : "muted"}
                    size="sm"
                    active={isActive}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                );
              })}
            </nav>

            <Separator orientation="vertical" className="h-10" />

            <Button
              asChild
              size="sm"
              variant={pathname === "/login" ? "default" : "muted"}
              active={pathname === "/login"}
            >
              <Link href="/login">Workspace</Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger
              className="lg:hidden"
              size="icon"
              variant="muted"
              aria-label="Open navigation"
            >
              Menu
            </SheetTrigger>
            <SheetContent className="space-y-6">
              <SheetHeader>
                <SheetTitle>Navigate the product</SheetTitle>
                <SheetDescription>
                  Public portfolio routes stay expressive. The internal
                  workspace keeps the same system with more structured content
                  management.
                </SheetDescription>
              </SheetHeader>
              <Separator />
              <div className="space-y-3">
                {links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <Button
                      key={link.href}
                      asChild
                      variant={isActive ? "blue" : "muted"}
                      className="w-full justify-between"
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  );
                })}
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-between"
                >
                  <Link href="/login">Open Workspace</Link>
                </Button>
              </div>
              <SheetFooter>
                <SheetClose className="w-full">Close Panel</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </TooltipProvider>
  );
}
