const fetch = require("node-fetch");

// extract date from snippet (basic)
const extractDate = (text) => {
  if (!text) return null;

  // Broadened regex to match various date formats (e.g., "Jan 12, 2026", "12 Feb 2026", "2026-03-15")
  const dateRegex = /(\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b)|(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b)/i;
  
  const match = text.match(dateRegex);
  if (match) {
    const date = new Date(match[0]);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

exports.fetchEventsFromSerper = async () => {
  // Ensure API Key exists
  if (!process.env.SERPER_API_KEY) {
    console.error("Missing SERPER_API_KEY in .env");
    return [];
  }

  const queries = [
    "upcoming hackathons 2026 devfolio",
    "coding competitions 2026 unstop",
    "MLH upcoming hackathons 2026",
    "major league hacking events 2026"
  ];

  let allResults = [];
  const seenLinks = new Set();

  for (const query of queries) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: query, num: 10 })
      });

      const data = await res.json();

      if (data.organic) {
        data.organic.forEach(item => {
          if (!seenLinks.has(item.link)) {
            let hostname = 'External';
            try {
              hostname = new URL(item.link).hostname.replace('www.', '');
            } catch (e) {}

            allResults.push({
              title: item.title,
              link: item.link,
              description: item.snippet,
              registrationDeadline: extractDate(item.snippet) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days if not found
              source: hostname
            });
            seenLinks.add(item.link);
          }
        });
      }
    } catch (err) {
      console.error(`Error fetching for query "${query}":`, err.message);
    }
  }

  return allResults;
};
