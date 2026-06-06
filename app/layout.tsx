import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { SiteDateSettingsProvider } from "@/app/components/site-date-settings-provider";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteSlogan } = await getSiteSettings();

  return {
    title: {
      default: `${siteName} — ${siteSlogan}`,
      template: `%s — ${siteName}`,
    },
    description: siteSlogan,
    openGraph: {
      title: siteName,
      description: siteSlogan,
      url: "https://battledrop.io",
      siteName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentAppUser();
  const dateSettings = await getEffectiveDateTimeSettingsForUser(user?.id ?? null);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[#f6f4ef] font-sans text-zinc-900 antialiased">
        <SiteDateSettingsProvider settings={dateSettings}>
          {children}
        </SiteDateSettingsProvider>
      </body>
    </html>
  );
}
