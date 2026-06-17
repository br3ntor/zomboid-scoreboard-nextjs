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
  B41_API_URL: parseUrl(
    "B41_API_URL",
    "https://wcn.westcoastnoobs.com/players",
  ),
  B42_API_URL: parseUrl(
    "B42_API_URL",
    "http://127.0.0.1:8080/api/leaderboard/kills",
  ),
} as const;
