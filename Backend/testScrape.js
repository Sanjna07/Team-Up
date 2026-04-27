const fetch = require('node-fetch');
const fs = require('fs');

async function test() {
  const res = await fetch('https://unstop.com/hackathons/attentionx-ai-hackathon-unsaidtalks-education-1674332');
  const html = await res.text();
  fs.writeFileSync('page.html', html);
  console.log("Wrote to page.html, size:", html.length);
}

test();
