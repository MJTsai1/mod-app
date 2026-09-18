/**
 * Central site configuration.
 *
 * Change server branding, URLs, rate limits, and IDs here. Translatable
 * display text (headings, questions, FAQ content, etc.) lives in
 * messages/*.json instead — see src/i18n/routing.ts for the locale list.
 */

export const reportCategoryValues = [
  "harassment",
  "spam",
  "cheating_exploiting",
  "inappropriate_content",
  "impersonation",
  "other",
] as const;

// English-only labels for admin/staff use (dashboard tables, Discord
// notification embeds) — always English since /admin is staff-only tooling
// outside the [locale] segment. The public report form uses translated
// labels from messages/*.json (report.categories.<id>) instead.
export const reportCategoryLabels: Record<(typeof reportCategoryValues)[number], string> = {
  harassment: "Harassment or bullying",
  spam: "Spam or advertising",
  cheating_exploiting: "Cheating or exploiting",
  inappropriate_content: "Inappropriate content",
  impersonation: "Impersonation",
  other: "Other",
};

export const siteConfig = {
  serverName: "Washington D.C. ERLC Roleplay",

  // Tailwind-friendly hex values. Used to generate CSS variables in globals.css.
  accentColor: "#8b5cf6", // purple-500
  accentColorHover: "#7c3aed", // purple-600
  accentColorSoft: "#a78bfa", // purple-400

  discordInviteUrl: "https://discord.gg/PRTdGazzZP",
  contactEmail: "coolmarcusjtsai1@gmail.com",

  socialLinks: {
    discord: "https://discord.gg/PRTdGazzZP",
    website: "",
    twitter: "",
  },

  // Link to a donation/tip page (e.g. Ko-fi, Buy Me a Coffee, Patreon,
  // PayPal.me). Leave as null to hide the "Support Us" button everywhere.
  donationUrl: null as string | null,

  // Public Atom feed, no API key needed. Find a channel ID via "view page
  // source" on the channel page and searching for "channelId".
  youtube: {
    officialChannelUrl: "https://www.youtube.com/@WashingtonERLC",
    officialChannelId: "UC8v_pO8bu5t7rv4D-lBbqyQ",
    coOwnerChannelUrl: "https://www.youtube.com/@RandomMJT",
  },

  // Requires "Server Widget" enabled under Discord Server Settings -> Widget.
  // Leave as null to hide the live member count on the homepage.
  discordGuildId: "1500149847158821026" as string | null,

  // Homepage quick-links grid — href/order only; title/description text
  // lives in messages/*.json under home.quickLinks (same order).
  quickLinkHrefs: ["/apply", "/report", "/appeal", "/faq"] as const,

  // Set to a number (e.g. 13) to enforce a minimum age on applications.
  // Leave as null to not enforce or display any minimum age requirement.
  minAge: null as number | null,

  // Set either to null to disable that particular cooldown.
  applicationRules: {
    reapplyCooldownDays: 30 as number | null,
    withdrawCooldownHours: 72 as number | null,
  },

  // Rate limiting for the public application submission endpoint.
  rateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 2,
  },

  // Scenario question ids asked in Step 4 of the application form — text
  // lives in messages/*.json under apply.scenarios.<id>.
  scenarioQuestionIds: [
    "scenario_unaware_rules",
    "scenario_toxic_conflict",
    "scenario_friend_breaks_rule",
    "scenario_staff_abuse",
    "scenario_biased_report",
  ] as const,

  // Motivation question ids asked in Step 5 — text lives in messages/*.json
  // under apply.motivations.<id>.
  motivationQuestionIds: [
    "motivation_why",
    "motivation_suitable",
    "motivation_good_moderator",
    "motivation_improve_server",
  ] as const,

  // Rate limiting for the report, ban appeal, and support request endpoints.
  reportRateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 5,
  },
  appealRateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 2,
  },
  supportRateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 5,
  },

  // FAQ ids, in display order — question/answer text lives in
  // messages/*.json under faq.items.<id>. The last one links to /support.
  faqIds: [
    "responseTime",
    "reapply",
    "howToReport",
    "banUnfair",
    "confidentiality",
    "stillNeedSupport",
  ] as const,
} as const;

export type SiteConfig = typeof siteConfig;
