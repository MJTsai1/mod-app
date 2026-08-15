/**
 * Whole-word profanity filter for free-text application fields.
 *
 * Deliberately matches whole words only (not substrings) so words like
 * "class", "assignment", "assessment", or "grass" are never flagged just
 * for containing "ass" — and "ass" itself is intentionally not banned.
 */

const BANNED_WORDS = new Set([
  "fuck",
  "fucks",
  "fucking",
  "fuckin",
  "fucked",
  "fucker",
  "fuckers",
  "motherfucker",
  "shit",
  "shits",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "bitching",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "pussy",
  "pussies",
  "whore",
  "whores",
  "slut",
  "sluts",
  "faggot",
  "faggots",
  "fag",
  "fags",
  "nigger",
  "niggers",
  "nigga",
  "niggas",
  "retard",
  "retards",
  "retarded",
  "cock",
  "cocks",
  "asshole",
  "assholes",
  "twat",
  "twats",
  "wanker",
  "wankers",
  "bastard",
  "bastards",
]);

export function findProfanity(text: string): string | null {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  for (const word of words) {
    const normalized = word.replace(/'/g, "");
    if (BANNED_WORDS.has(normalized)) return normalized;
  }
  return null;
}

export function containsProfanity(text: string): boolean {
  return findProfanity(text) !== null;
}
