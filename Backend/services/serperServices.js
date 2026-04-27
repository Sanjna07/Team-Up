const fetch = require("node-fetch");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const fetchUnstopEvents = async () => {
    try {
        const res = await fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=30");
        const data = await res.json();
        
        if (!data || !data.data || !data.data.data) return [];
        return data.data.data.map(item => {
            let loc = "Location not specified";
            if (item.region && item.region.toLowerCase().includes('online')) loc = "Virtual";
            else if (item.locations && item.locations.length > 0) loc = item.locations.map(l => l.city || l.state).filter(Boolean).join(', ');
            else if (item.address_with_country_logo && item.address_with_country_logo.city) loc = item.address_with_country_logo.city;
            
            let deadline = null;
            if (item.regnRequirements && item.regnRequirements.end_regn_dt) {
                deadline = new Date(item.regnRequirements.end_regn_dt);
            }
            
            return {
                title: item.title,
                link: item.seo_url || `https://unstop.com/${item.public_url}`,
                description: item.details ? item.details.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : '',
                registrationDeadline: deadline,
                location: loc && loc.length > 0 ? loc : "Location not specified",
                source: "unstop.com"
            };
        });
    } catch (e) {
        console.error("Error fetching Unstop API", e);
        return [];
    }
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

const extractEventDetailsBatch = async (eventsSubset) => {
  if (!process.env.GEMINI_API_KEY || eventsSubset.length === 0) {
    return eventsSubset.map(() => ({ registrationDeadline: null, location: "Unknown" }));
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the following list of events. For each event, extract the LAST date of registration (or event date if registration is unavailable) and the location (e.g., "Virtual", "New York, NY", or "Unknown").
Return ONLY a valid JSON array of objects in the exact same order as the input. Do not include markdown formatting like \`\`\`json.
Format: [{"registrationDeadline": "YYYY-MM-DD" or null, "location": "Location String" or "Unknown"}]

Events:
${JSON.stringify(eventsSubset.map(e => ({ title: e.title, snippet: e.description })))}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("\`\`\`json")) text = text.substring(7);
    if (text.endsWith("\`\`\`")) text = text.substring(0, text.length - 3);
    
    // Sometimes it might still output markdown or other text, parse JSON
    const data = JSON.parse(text.trim());
    
    if (!Array.isArray(data) || data.length !== eventsSubset.length) {
      throw new Error("Mismatch in extracted data length");
    }

    return data.map(item => ({
      registrationDeadline: (item.registrationDeadline && item.registrationDeadline !== "null" && item.registrationDeadline !== null) 
                            ? new Date(item.registrationDeadline) 
                            : null,
      location: item.location || "Location not specified"
    }));
  } catch (err) {
    console.error("Error extracting event details with Gemini:", err.message);

    const extractDetailsFallback = (text) => {
      if (!text) return { date: null, loc: "Location not specified" };
      let parsedDate = null;
      let parsedLoc = "Location not specified";

      // 1. Try to find date
      const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b)|(\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b)|(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b)/i;
      const match = text.match(dateRegex);
      if (match) {
        let d = new Date(match[0]);
        if (isNaN(d.getTime()) && match[3]) {
          d = new Date(`${match[3]} ${new Date().getFullYear()}`);
        }
        if (!isNaN(d.getTime())) {
          parsedDate = d;
        }
      }

      // 2. Try to find common locations
      const locRegex = /\b(Virtual|Online|Remote|New York|San Francisco|Los Angeles|Chicago|Seattle|Boston|Austin|London|Toronto|India|Delhi|Bangalore|Hyderabad|Remote)\b/i;
      const locMatch = text.match(locRegex);
      if (locMatch) {
         parsedLoc = locMatch[0];
         if (['Virtual', 'Online', 'Remote'].includes(parsedLoc)) {
            parsedLoc = "Virtual";
         }
      }

      return { date: parsedDate, loc: parsedLoc };
    };

    return eventsSubset.map((e) => {
      const details = extractDetailsFallback(e.snippet);
      return { 
        registrationDeadline: details.date, 
        location: details.loc
      };
    });
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
    `site:devfolio.co hackathon ${currentYear} OR ${nextYear}`,
    `site:devpost.com hackathon ${currentYear} OR ${nextYear}`,
    `"registration open" MLH hackathon ${currentYear} OR ${nextYear}`
  ];

  let rawResults = [];
  const seenLinks = new Set();
  
  // Fetch from Unstop automatically without serper mapping
  const unstopEvents = await fetchUnstopEvents();
  unstopEvents.forEach(item => {
      rawResults.push(item);
      seenLinks.add(item.link);
  });

  for (const query of queries) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: query, num: 20 })
      });

      const data = await res.json();

      if (data.organic) {
        data.organic.forEach(item => {
          if (!seenLinks.has(item.link) && isValidEventLink(item.link)) {
            let hostname = 'External';
            try {
              hostname = new URL(item.link).hostname.replace(/^www\./, '');
            } catch (e) {}

            rawResults.push({
              title: item.title,
              link: item.link,
              description: item.snippet,
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

  // Batch process with Gemini to get deadlines and locations for Serper-scraped events
  // Exclude unstop items which already have exact deadlines/locations
  const eventsToParse = rawResults.filter(e => e.source !== "unstop.com");
  
  if (eventsToParse.length > 0) {
    const batchedDetails = await extractEventDetailsBatch(eventsToParse);
    let parsedIdx = 0;
    for (let i = 0; i < rawResults.length; i++) {
      if (rawResults[i].source !== "unstop.com") {
        rawResults[i].registrationDeadline = batchedDetails[parsedIdx].registrationDeadline;
        rawResults[i].location = batchedDetails[parsedIdx].location;
        parsedIdx++;
      }
    }
  }

  return rawResults;
};
