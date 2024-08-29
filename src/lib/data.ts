export async function getPlayerData(server: string) {
  const res = await fetch(`https://wcn.brent-dev.com/${server}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  console.log("----------------------------");
  console.log(res.headers.get("date"));
  console.log(`Got fresh ${server} data hooray!`);

  return res.json();
}
