import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `FAQ — ${siteConfig.serverName}`,
  description: `Frequently asked questions about ${siteConfig.serverName}.`,
};

export default function FaqPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {siteConfig.faqs.map((faq) => (
          <div key={faq.question} className="card p-6">
            <h2 className="text-base font-semibold text-[var(--color-text)]">{faq.question}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
