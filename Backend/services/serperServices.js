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

// Validates if the given link is a specific event page and not a generic list or irrelevant site.
const isValidEventLink = (urlStr) => {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = url.pathname.replace(/\/$/, ""); // remove trailing slash

    // 1. Filter out unwanted domains (social media, video platforms, forums, github)
    const rejectedDomains = [
      "youtube.com", "youtu.be", "linkedin.com", "instagram.com", 
      "facebook.com", "twitter.com", "x.com", "github.com",
      "reddit.com", "quora.com", "medium.com", "pinterest.com"
    ];
    if (rejectedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
      return false;
    }

    // 2. Reject root paths or generic landing/auth pages
    if (!pathname || pathname === "" || pathname === "/") return false;
    const genericPaths = ["/dashboard", "/login", "/signup", "/register", "/about", "/contact", "/home"];
    if (genericPaths.includes(pathname.toLowerCase())) return false;

    // 3. Platform-specific filtering (reject main directory/listing pages)
    if (hostname.includes("unstop.com")) {
      const listingPages = ["/hackathons", "/competitions", "/events", "/internships", "/jobs", "/courses"];
      if (listingPages.includes(pathname.toLowerCase())) return false;
    }

    if (hostname.includes("devfolio.co")) {
      const listingPages = ["/hackathons", "/projects"];
      if (listingPages.includes(pathname.toLowerCase())) return false;
    }

    if (hostname.includes("mlh.io")) {
      if (pathname.toLowerCase() === "/events" || pathname.toLowerCase().startsWith("/seasons")) return false;
    }

    if (hostname.includes("devpost.com")) {
      if (pathname.toLowerCase() === "/hackathons") return false;
    }

    return true;
  } catch (err) {
    return false; // Invalid URL
  }
};

exports.fetchEventsFromSerper = async () => {
  // Ensure API Key exists
  if (!process.env.SERPER_API_KEY) {
    console.error("Missing SERPER_API_KEY in .env");
    return [];
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // Refined queries aiming for actual event pages using site: operators
  const queries = [
    `site:unstop.com/hackathons OR site:unstop.com/competitions hackathon ${currentYear} OR ${nextYear}`,
    `site:devfolio.co hackathon ${currentYear} OR ${nextYear}`,
    `site:devpost.com hackathon ${currentYear} OR ${nextYear}`,
    `"registration open" MLH hackathon ${currentYear} OR ${nextYear}`
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
        body: JSON.stringify({ q: query, num: 20 }) // Fetch more to account for filtered out results
      });

      const data = await res.json();

      if (data.organic) {
        data.organic.forEach(item => {
          if (!seenLinks.has(item.link) && isValidEventLink(item.link)) {
            let hostname = 'External';
            try {
              hostname = new URL(item.link).hostname.replace(/^www\./, '');
            } catch (e) {}

            allResults.push({
              title: item.title,
              link: item.link,
              description: item.snippet,
              // Default to 30 days if not found
              registrationDeadline: extractDate(item.snippet) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
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
