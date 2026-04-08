const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using the embedding model
  model = genAI.getGenerativeModel({ model: "text-embedding-004" });
}

/**
 * Normalizes a user document to a single paragraph representing their profile
 * to be embedded by Google Gemini.
 */
const formatUserProfileForEmbedding = (user) => {
  const skills = user.skills && user.skills.length > 0 ? user.skills.join(", ") : "None";
  const domains = user.domains && user.domains.length > 0 ? user.domains.join(", ") : "None";
  const personality = user.personality?.label || "Unknown";
  const energy = user.personality?.vector?.energy ?? 50;
  const planning = user.personality?.vector?.planning ?? 50;
  const collaboration = user.personality?.vector?.collaboration ?? 50;

  return `User Profile. 
Skills: ${skills}. 
Domains of interest: ${domains}. 
Personality Type: ${personality}. 
Energy Level: ${energy}/100. 
Planning: ${planning}/100. 
Collaboration: ${collaboration}/100.`;
};

/**
 * Generates an embedding vector for a given user object.
 * Returns an array of numbers (768 dimensions for text-embedding-004).
 */
const generateUserEmbedding = async (user) => {
  if (!model) {
    console.warn("Gemini API missing, cannot generate embedding.");
    return null;
  }

  try {
    const textToEmbed = formatUserProfileForEmbedding(user);
    const result = await model.embedContent(textToEmbed);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embeddings from Gemini:", error.message);
    return null;
  }
};

module.exports = {
  generateUserEmbedding,
};
