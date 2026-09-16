import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { SubmissionSuccess } from "@/components/site/SubmissionSuccess";

export const metadata: Metadata = {
  title: `Support Request Submitted — ${siteConfig.serverName}`,
  robots: { index: false },
};

const REFERENCE_RE = /^[A-Z0-9-]{5,40}$/;

export default async function SupportSuccessPage(props: PageProps<"/support/success">) {
  const searchParams = await props.searchParams;
  const refParam = searchParams.ref;
  const reference = typeof refParam === "string" && REFERENCE_RE.test(refParam) ? refParam : null;

  return (
    <SubmissionSuccess
      heading="Support Request Submitted"
      message="Thanks for reaching out. A staff member will reply to your request."
      reference={reference}
      followUp="Keep this reference for your records. You'll see staff replies — and can reply back — from your Account page."
    />
  );
}
