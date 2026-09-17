import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { SubmissionSuccess } from "@/components/site/SubmissionSuccess";

export const metadata: Metadata = {
  title: `Application Submitted — ${siteConfig.serverName}`,
  robots: { index: false },
};

const REFERENCE_RE = /^[A-Z0-9-]{5,40}$/;

export default async function ApplySuccessPage(props: PageProps<"/[locale]/apply/success">) {
  const searchParams = await props.searchParams;
  const refParam = searchParams.ref;
  const reference = typeof refParam === "string" && REFERENCE_RE.test(refParam) ? refParam : null;
  const t = await getTranslations("apply.success");

  return (
    <SubmissionSuccess
      heading={t("heading")}
      message={t("message")}
      reference={reference}
      followUp={t("followUp")}
    />
  );
}
