import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { SubmissionSuccess } from "@/components/site/SubmissionSuccess";

export const metadata: Metadata = {
  title: `Appeal Submitted — ${siteConfig.serverName}`,
  robots: { index: false },
};

const REFERENCE_RE = /^[A-Z0-9-]{5,40}$/;

export default async function AppealSuccessPage(props: PageProps<"/appeal/success">) {
  const searchParams = await props.searchParams;
  const refParam = searchParams.ref;
  const reference = typeof refParam === "string" && REFERENCE_RE.test(refParam) ? refParam : null;

  return (
    <SubmissionSuccess
      heading="Appeal Submitted"
      message="Thanks for submitting your ban appeal. The staff team will review it."
      reference={reference}
      followUp="Keep this reference for your records. You can check its status any time from your Account page."
    />
  );
}
