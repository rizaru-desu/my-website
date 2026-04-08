"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
