// netlify/functions/co2.js

export async function handler(event, context) {
  const NOAA_URL =
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt";

  try {
    const resp = await fetch(NOAA_URL);
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: "Failed to fetch NOAA data" }),
      };
    }

    const text = await resp.text();
    const lines = text.trim().split("\n");

    let co2 = null;
    let year, month, day;

    // Walk from the bottom to find latest valid daily mean
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 5) continue;

      year = parts[0];
      month = parts[1];
      day = parts[2];

      const value = parseFloat(parts[4]); // daily mean ppm

      if (!Number.isFinite(value) || value < 200 || value > 700) continue;

      co2 = value;
      break;
    }

    if (co2 === null) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No valid CO₂ value found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        co2,
        year,
        month,
        day,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Exception fetching CO₂ data" }),
    };
  }
}
