import localFont from "next/font/local";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@mdxeditor/editor/style.css";

import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

const everettDisplay = localFont({
  src: "./fonts/everett-medium.woff2",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: false,
});

const everettBody = localFont({
  src: "./fonts/everett-regular.woff2",
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Rizal Achmad | Portfolio Platform",
  description:
    "A portfolio platform with bold editorial styling, layered layouts, and recruiter-friendly public pages.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${everettDisplay.variable} ${everettBody.variable} page-shell antialiased`}
      >
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
