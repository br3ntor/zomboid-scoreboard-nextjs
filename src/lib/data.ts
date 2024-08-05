export async function getPlayerData(server: string) {
  console.log(`requesting fresh ${server} data hooray!`);
  const res = await fetch(`https://wcn.brent-dev.com/${server}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
