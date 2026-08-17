/**
 * Central site configuration.
 *
 * Change server branding, requirements, questions, and contact info here —
 * nothing else in the codebase should need editing for a rebrand.
 */

export const reportCategoryValues = [
  "harassment",
  "spam",
  "cheating_exploiting",
  "inappropriate_content",
  "impersonation",
  "other",
] as const;

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
  tagline: "Think you've got what it takes to help our community?",
  description:
    "Your hub for the community — quick links, moderator applications, member support, and the latest from our YouTube channel.",

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

  // Public Atom feed, no API key needed. Find a channel ID via "view page
  // source" on the channel page and searching for "channelId".
  youtube: {
    officialChannelUrl: "https://www.youtube.com/@WashingtonERLC",
    officialChannelId: "UC8v_pO8bu5t7rv4D-lBbqyQ",
    coOwnerChannelUrl: "https://www.youtube.com/@RandomMJT",
    coOwnerChannelLabel: "Co-owner's personal channel",
  },

  // Requires "Server Widget" enabled under Discord Server Settings -> Widget.
  // Leave as null to hide the live member count on the homepage.
  discordGuildId: "1500149847158821026" as string | null,

  // Homepage quick-links grid.
  quickLinks: [
    {
      title: "Apply Now",
      description: "Apply to join the moderation team.",
      href: "/apply",
      external: false,
    },
    {
      title: "Report a Member",
      description: "Let staff know about a rule-breaker.",
      href: "/report",
      external: false,
    },
    {
      title: "Ban Appeal",
      description: "Think you were banned unfairly? Tell us why.",
      href: "/appeal",
      external: false,
    },
    {
      title: "FAQ",
      description: "Answers to common questions.",
      href: "/faq",
      external: false,
    },
  ] as const,

  // Set to a number (e.g. 13) to enforce a minimum age on applications.
  // Leave as null to not enforce or display any minimum age requirement.
  minAge: null as number | null,

  // Set either to null to disable that particular cooldown.
  applicationRules: {
    reapplyCooldownDays: 30 as number | null,
    withdrawCooldownHours: 72 as number | null,
  },

  aboutRole: {
    heading: "About the Role",
    intro:
      "Moderators are trusted members of the community who help the staff team keep things running smoothly.",
    responsibilities: [
      "Enforce server rules fairly and consistently",
      "Assist members with questions and issues",
      "Handle reports promptly and discreetly",
      "De-escalate conflicts between members",
      "Keep the community welcoming and inclusive",
      "Work closely with the wider staff team",
    ],
  },

  requirements: [
    "Active member of the server",
    "Understands and follows the rules",
    "Mature and responsible",
    "Respectful towards members",
    "Works well with staff",
    "Good moderation history",
    "Willing to learn",
  ],

  // Rate limiting for the public application submission endpoint.
  rateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 2,
  },

  // Scenario questions asked in Step 4 of the application form.
  scenarioQuestions: [
    {
      id: "scenario_unaware_rules",
      question:
        "A member repeatedly breaks the rules but claims they didn't know the rules. What would you do?",
    },
    {
      id: "scenario_toxic_conflict",
      question:
        "Two members are arguing and the situation is becoming toxic. How would you handle it?",
    },
    {
      id: "scenario_friend_breaks_rule",
      question: "A friend of yours breaks a server rule. What would you do?",
    },
    {
      id: "scenario_staff_abuse",
      question:
        "You discover another moderator abusing their permissions. What would you do?",
    },
    {
      id: "scenario_biased_report",
      question:
        "Someone submits a report against a member you personally dislike. How would you ensure you handle the situation fairly?",
    },
  ],

  // Motivation questions asked in Step 5 of the application form.
  motivationQuestions: [
    {
      id: "motivation_why",
      question: "Why do you want to become a moderator?",
    },
    {
      id: "motivation_suitable",
      question: "What makes you suitable for the role?",
    },
    {
      id: "motivation_good_moderator",
      question: "What makes a good moderator?",
    },
    {
      id: "motivation_improve_server",
      question: "What could you improve about the server?",
    },
  ],

  confirmationStatement:
    "I confirm that the information provided is accurate and understand that submitting an application does not guarantee acceptance.",

  privacy: {
    contactMethod:
      "If you have questions about your data or wish to request its deletion, contact server administration.",
  },

  // Rate limiting for the report and ban appeal submission endpoints.
  reportRateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 5,
  },
  appealRateLimit: {
    windowMinutes: 60 * 24,
    maxSubmissionsPerWindow: 2,
  },

  faqs: [
    {
      question: "How long does it take to hear back about my application?",
      answer:
        "The staff team reviews applications as they come in. Response times vary depending on volume, but you can always check your status using the reference code you received.",
    },
    {
      question: "Can I apply again if I'm rejected?",
      answer:
        "Yes. Take some time to be more active and engaged in the community, then feel free to apply again later.",
    },
    {
      question: "How do I report a member for breaking the rules?",
      answer:
        "Use the Report a Member page. You'll need to sign in with Discord first so we can follow up with you if we need more information.",
    },
    {
      question: "I think I was banned unfairly — what can I do?",
      answer:
        "Submit a ban appeal through the Ban Appeal page. Explain your situation clearly and honestly — the staff team reviews every appeal.",
    },
    {
      question: "Will my report or appeal be kept confidential?",
      answer:
        "Reports and appeals are only visible to authorised staff. See the Privacy Notice for full details on how your information is handled.",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
