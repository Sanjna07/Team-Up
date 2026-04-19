const { getNeo4jSession } = require("../config/neo4j");
const User = require("../models/User");

exports.getRecommendations = async (req, res) => {
  let session;
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Filter params
    let { domains, skills } = req.query;
    domains = domains ? domains.split(",") : [];
    skills = skills ? skills.split(",") : [];

    session = getNeo4jSession();

    // Hybrid Matchmaking Cypher Query
    const query = `
      MATCH (current:User {id: $userId})
      
      // 1. Hard Filtering
      MATCH (candidate:User)
      WHERE candidate.id <> $userId
        // If domain filters provided, require at least one match
        AND (size($domains) = 0 OR any(d IN $domains WHERE d IN candidate.domains))
        // If skill filters provided, require at least one match
        AND (size($skills) = 0 OR any(s IN $skills WHERE s IN candidate.skills))
        // Skip users that are already friends
        AND NOT (current)-[:FRIENDS_WITH]-(candidate)
      
      // 2. Graph Connectivity Score
      OPTIONAL MATCH (current)-[:FRIENDS_WITH]-(mutual:User)-[:FRIENDS_WITH]-(candidate)
      WITH current, candidate, count(mutual) AS mutualFriendsCount
      
      OPTIONAL MATCH (current)-[:JOINED_ROOM]->(r:Room)<-[:JOINED_ROOM]-(candidate)
      WITH current, candidate, mutualFriendsCount, count(r) AS sharedRoomsCount
      
      // 3. Vector Similarity
      // Calculates cosine similarity using the stored text embeddings
      WITH current, candidate, mutualFriendsCount, sharedRoomsCount,
           vector.similarity.cosine(current.embedding, candidate.embedding) AS vectorScore
           
      // 4. Combined Score & Ranking
      WITH candidate, vectorScore, mutualFriendsCount, sharedRoomsCount,
           (COALESCE(vectorScore, 0) * 10) + (mutualFriendsCount * 2) + sharedRoomsCount AS finalScore
      ORDER BY finalScore DESC
      LIMIT 20
      
      RETURN candidate.id AS id, 
             candidate.name AS name,
             candidate.skills AS skills,
             candidate.domains AS domains,
             vectorScore, 
             mutualFriendsCount, 
             sharedRoomsCount, 
             finalScore
    `;

    const params = {
      userId: userId.toString(),
      domains: domains || [],
      skills: skills || []
    };

    const result = await session.run(query, params);

    const matches = result.records.map(record => ({
      id: record.get("id"),
      name: record.get("name"),
      skills: record.get("skills"),
      domains: record.get("domains"),
      scores: {
        vectorSimilarity: record.get("vectorScore"),
        mutualFriends: record.get("mutualFriendsCount").toNumber(),
        sharedRooms: record.get("sharedRoomsCount").toNumber(),
        total: record.get("finalScore")
      }
    }));

    // Optionally hydrate profile images from MongoDB
    const matchIds = matches.map(m => m.id);
    const mongoData = await User.find({ _id: { $in: matchIds } }).select("profileImage personality email");
    
    const hydratedMatches = matches.map(match => {
      const dbData = mongoData.find(u => u._id.toString() === match.id);
      return {
        ...match,
        profileImage: dbData?.profileImage || null,
        personality: dbData?.personality || null,
        email: dbData?.email || null,
      };
    });

    res.status(200).json({ success: true, recommendations: hydratedMatches });
  } catch (error) {
    console.error("Matchmaking error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (session) await session.close();
  }
};
