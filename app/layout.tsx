import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BattleDrop — Vote on this week's best products",
  description:
    "Weekly product battles for early-stage founders. Community votes, top 5 enter the Hall of Fame.",
  openGraph: {
    title: "BattleDrop",
    description: "Vote on this week's best founder products",
    url: "https://battledrop.io",
    siteName: "BattleDrop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[#f6f4ef] font-sans text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
