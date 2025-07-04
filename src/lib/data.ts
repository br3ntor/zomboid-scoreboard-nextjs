export async function getPlayerData() {
  const res = await fetch("https://wcn.westcoastnoobs.com/players", {
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  console.log("----------------------------");
  console.log(res.headers.get("date"));
  console.log("Player data fetched.");

  return res.json();
}
