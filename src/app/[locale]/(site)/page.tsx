import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { getRecentYoutubeVideos } from "@/lib/youtube";
import { getServerWidget } from "@/lib/discordWidget";
import { YoutubeVideoGrid } from "@/components/site/YoutubeVideoGrid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: `${siteConfig.serverName} — Community Hub`,
    description: t("siteDescription"),
  };
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0 text-[var(--color-accent-soft)]"
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 10.2l2.2 2.2 4.8-4.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HomePage() {
  const [videos, serverWidget] = await Promise.all([
    getRecentYoutubeVideos(siteConfig.youtube.officialChannelId, 12),
    getServerWidget(siteConfig.discordGuildId),
  ]);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const quickLinks = t.raw("quickLinks") as { title: string; description: string }[];
  const responsibilities = t.raw("responsibilities") as string[];
  const requirements = t.raw("requirements") as string[];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(139,92,246,0.25), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
            {siteConfig.serverName}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            <span className="gradient-text">{t("welcome")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-[var(--color-text-muted)] sm:text-xl">
            {tCommon("siteDescription")}
          </p>
          {siteConfig.socialLinks.discord && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <a
                href={siteConfig.socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full px-8 py-4 text-base sm:w-auto"
              >
                {t("joinDiscord")}
              </a>
              {serverWidget && (
                <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--color-success)" }}
                    aria-hidden
                  />
                  {t("onlineNow", { count: serverWidget.presenceCount.toLocaleString() })}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.quickLinkHrefs.map((href, index) => {
              const link = quickLinks[index];
              return (
                <Link
                  key={href}
                  href={href}
                  className="card group flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--color-text)]">{link.title}</h3>
                    <span className="text-[var(--color-accent-soft)] transition group-hover:translate-x-0.5">
                      <ArrowIcon />
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent YouTube uploads */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("latestUploads")}</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">
              {t("recentVideosFrom")}{" "}
              <a
                href={siteConfig.youtube.officialChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-accent-soft)] hover:underline"
              >
                {t("ourOfficialChannel")}
              </a>
              .
            </p>
          </div>

          {videos.length > 0 ? (
            <YoutubeVideoGrid videos={videos} />
          ) : (
            <p className="mt-12 text-center text-sm text-[var(--color-text-subtle)]">
              {t("couldntLoadUploads")}
            </p>
          )}

          <p className="mt-8 text-center text-sm text-[var(--color-text-subtle)]">
            {t("alsoCheckOut")}{" "}
            <a
              href={siteConfig.youtube.coOwnerChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-accent-soft)] hover:underline"
            >
              {t("coOwnerChannelLabel")}
            </a>
            .
          </p>
        </div>
      </section>

      {/* About the role */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("aboutRoleHeading")}</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">{t("aboutRoleIntro")}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {responsibilities.map((item) => (
              <div key={item} className="card flex items-start gap-3 p-5">
                <CheckIcon />
                <p className="text-sm text-[var(--color-text)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("requirementsHeading")}</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">{t("requirementsIntro")}</p>
          </div>

          <div className="card-elevated mx-auto mt-12 max-w-2xl p-6 sm:p-8">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-sm text-[var(--color-text)]">{requirement}</span>
                </li>
              ))}
            </ul>
            {siteConfig.minAge !== null && (
              <p className="field-hint mt-6 border-t border-[var(--color-border)] pt-4">
                {t("minAge", { age: siteConfig.minAge })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="card-elevated mx-auto max-w-4xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("ctaHeading")}</h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--color-text-muted)]">{t("ctaBody")}</p>
          <Link href="/apply" className="btn btn-primary mt-8 px-8 py-4 text-base">
            {t("applyNow")}
          </Link>
        </div>
      </section>
    </>
  );
}
