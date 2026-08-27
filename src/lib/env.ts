function parseUrl(envName: string, fallback: string): string {
  const value = process.env[envName] ?? fallback;
  try {
    new URL(value);
  } catch {
    throw new Error(`${envName} is not a valid URL: ${value}`);
  }
  return value;
}

export const env = {
  // B41_API_URL decommissioned; see git history to bring it back.
  // B41_API_URL: parseUrl(
  //   "B41_API_URL",
  //   "https://wcn.westcoastnoobs.com/players",
  // ),
  B42_MODDED_API_URL: parseUrl(
    "B42_MODDED_API_URL",
    "https://pz.westcoastnoobs.com/api/leaderboard/kills",
  ),
  B42_VANILLA_API_URL: parseUrl(
    "B42_VANILLA_API_URL",
    "https://pz.westcoastnoobs.com/api/leaderboard/vanilla/kills",
  ),
} as const;
