"use server";

export async function getPlayerData(server: string) {
  const res = await fetch(`https://wcn.brent-dev.com/${server}`);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
