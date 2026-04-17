import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "@mdxeditor/editor/style.css";

import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rizal Achmad | Portfolio Platform",
  description:
    "A portfolio platform with bold editorial styling, layered layouts, and recruiter-friendly public pages.",
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
        className={`${archivoBlack.variable} ${spaceGrotesk.variable} page-shell antialiased`}
      >
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
