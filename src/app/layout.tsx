import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "West Coast Noobs Scoreboard",
  description: "Leaderboards for the West Coast Noobs Project Zombie Servers!",
};

// Left suppressHydrationWarning out of html tag
// https://ui.shadcn.com/docs/installation/next
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "dark min-h-screen px-3 font-sans antialiased md:container lg:max-w-6xl",
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
