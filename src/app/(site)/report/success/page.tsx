import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { SubmissionSuccess } from "@/components/site/SubmissionSuccess";

export const metadata: Metadata = {
  title: `Report Submitted — ${siteConfig.serverName}`,
  robots: { index: false },
};

const REFERENCE_RE = /^[A-Z0-9-]{5,40}$/;

export default async function ReportSuccessPage(props: PageProps<"/report/success">) {
  const searchParams = await props.searchParams;
  const refParam = searchParams.ref;
  const reference = typeof refParam === "string" && REFERENCE_RE.test(refParam) ? refParam : null;

  return (
    <SubmissionSuccess
      heading="Report Submitted"
      message="Thanks for letting us know. Your report has been sent to the staff team."
      reference={reference}
      followUp="Keep this reference for your records. You can check its status any time from your Account page. Please don't take matters into your own hands while it's reviewed."
    />
  );
}
