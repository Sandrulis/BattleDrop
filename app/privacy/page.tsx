import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { LegalPageView } from "@/app/components/legal-page-view";
import { getSiteLegalPageContent } from "@/app/lib/site-legal-pages/get-site-legal-pages";

export const metadata: Metadata = {
  title: "Privacy",
};

export default async function PrivacyPage() {
  const content = await getSiteLegalPageContent("privacy");

  if (!content) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <LegalPageView title="Privacy" content={content} />
      </main>
      <SiteFooter />
    </>
  );
}
