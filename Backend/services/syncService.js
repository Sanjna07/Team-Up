const { getNeo4jSession } = require("../config/neo4j");
const { generateUserEmbedding } = require("./embeddingService");

/**
 * Upserts a User node in Neo4j with their profile metrics.
 * Also generates and attaches their Gemini text embedding.
 */
const syncUser = async (user) => {
  let session;
  try {
    session = getNeo4jSession();
    
    // Generate new embedding using Gemini
    const embedding = await generateUserEmbedding(user);

    const params = {
      id: user._id.toString(),
      name: user.name,
      skills: user.skills || [],
      domains: user.domains || [],
      embedding: embedding || []
    };

    const query = `
      MERGE (u:User {id: $id})
      SET u.name = $name,
          u.skills = $skills,
          u.domains = $domains
          ${embedding ? ", u.embedding = $embedding" : ""}
      RETURN u
    `;

    await session.run(query, params);
    console.log(`[Neo4j Sync] Upserted User: ${user.name}`);
  } catch (error) {
    console.error(`[Neo4j Sync] Error syncing user ${user?._id}:`, error.message);
  } finally {
    if (session) await session.close();
  }
};

/**
 * Upserts a Room so relationships have a target to attach to.
 */
const syncRoom = async (room) => {
  let session;
  try {
    session = getNeo4jSession();
    
    const params = {
      id: room._id.toString(),
      name: room.name,
      domain: room.domain
    };

    const query = `
      MERGE (r:Room {id: $id})
      SET r.name = $name, r.domain = $domain
      RETURN r
    `;

    await session.run(query, params);
  } catch (error) {
    console.error(`[Neo4j Sync] Error syncing room ${room?._id}:`, error.message);
  } finally {
    if (session) await session.close();
  }
};

/**
 * Creates a JOINED_ROOM relationship between a User and a Room.
 */
const syncRoomJoin = async (userId, roomId) => {
  let session;
  try {
    session = getNeo4jSession();
    const params = {
      userId: userId.toString(),
      roomId: roomId.toString()
    };

    const query = `
      MATCH (u:User {id: $userId})
      MATCH (r:Room {id: $roomId})
      MERGE (u)-[:JOINED_ROOM]->(r)
    `;

    await session.run(query, params);
    console.log(`[Neo4j Sync] User ${userId} joined Room ${roomId}`);
  } catch (error) {
    console.error(`[Neo4j Sync] Error syncing room join:`, error.message);
  } finally {
    if (session) await session.close();
  }
};

/**
 * Creates an undirected (bi-directional semantic) FRIENDS_WITH relationship.
 */
const syncFriendship = async (userId1, userId2) => {
  let session;
  try {
    session = getNeo4jSession();
    const params = {
      u1Id: userId1.toString(),
      u2Id: userId2.toString()
    };

    // Neo4j relationships are inherently directional, but we query them undirected.
    const query = `
      MATCH (u1:User {id: $u1Id})
      MATCH (u2:User {id: $u2Id})
      MERGE (u1)-[:FRIENDS_WITH]-(u2)
    `;

    await session.run(query, params);
    console.log(`[Neo4j Sync] Friends connection created between ${userId1} and ${userId2}`);
  } catch (error) {
    console.error(`[Neo4j Sync] Error syncing friendship:`, error.message);
  } finally {
    if (session) await session.close();
  }
};

module.exports = {
  syncUser,
  syncRoom,
  syncRoomJoin,
  syncFriendship
};
