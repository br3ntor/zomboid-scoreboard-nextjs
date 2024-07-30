"use server";

import os from "os";

export async function getOSInfo() {
  const osType = os.type(); // 'Darwin', 'Linux', 'Windows_NT'
  const osRelease = os.release(); // Kernel version

  // Example usage:
  // console.log(`Operating System: ${osType}`);
  // console.log(`OS Release Version: ${osRelease}`);
  return `Operating System: ${osType}\nOS Release Version: ${osRelease}`;
}

export async function getPlayerData(server: string) {
  const res = await fetch(`https://wcn.brent-dev.com/${server}`);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
