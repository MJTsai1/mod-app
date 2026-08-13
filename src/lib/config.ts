/**
 * Central site configuration.
 *
 * Change server branding, requirements, questions, and contact info here —
 * nothing else in the codebase should need editing for a rebrand.
 */

export const siteConfig = {
  serverName: "Washington D.C. ERLC Roleplay",
  tagline: "Think you've got what it takes to help our community?",
  description:
    "Apply to join the moderation team and help us keep the community safe, welcoming, and fun for everyone.",

  // Tailwind-friendly hex values. Used to generate CSS variables in globals.css.
  accentColor: "#8b5cf6", // purple-500
  accentColorHover: "#7c3aed", // purple-600
  accentColorSoft: "#a78bfa", // purple-400

  discordInviteUrl: "https://discord.gg/fn4pCJqGSv",
  contactEmail: "coolmarcusjtsai1@gmail.com",

  socialLinks: {
    discord: "https://discord.gg/fn4pCJqGSv",
    website: "",
    twitter: "",
  },

  // Set to a number (e.g. 13) to enforce a minimum age on applications.
  // Leave as null to not enforce or display any minimum age requirement.
  minAge: null as number | null,

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
} as const;

export type SiteConfig = typeof siteConfig;
