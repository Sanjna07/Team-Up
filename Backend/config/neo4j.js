const neo4j = require("neo4j-driver");
require("dotenv").config();

let driver;

const initNeo4j = async () => {
  if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
    console.warn("Neo4j credentials not found. Neo4j will not be initialized.");
    return;
  }

  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );

    const session = driver.session();
    
    // Test connection
    const result = await session.run("RETURN 1 AS num");
    console.log(`Neo4j Connected successfully. Test query returned: ${result.records[0].get("num").toNumber()}`);

    // Create constraints and Vector Index
    // Ensure User node has unique ID
    await session.run(`
      CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT room_id IF NOT EXISTS FOR (r:Room) REQUIRE r.id IS UNIQUE
    `);

    // Create a vector index on the `embedding` property of the `User` node
    // Note: Dimensions for Gemini text-embedding-004 is 768
    await session.run(`
      CREATE VECTOR INDEX user_embedding IF NOT EXISTS
      FOR (u:User) ON (u.embedding)
      OPTIONS { indexConfig: {
        \`vector.dimensions\`: 768,
        \`vector.similarity_function\`: 'cosine'
      }}
    `);
    
    console.log("Neo4j Constraints and Vector Index initialized.");
    await session.close();
  } catch (err) {
    console.error("Error initializing Neo4j:", err);
  }
};

const getNeo4jSession = () => {
  if (!driver) throw new Error("Neo4j Driver not initialized.");
  return driver.session();
};

const closeNeo4j = async () => {
  if (driver) {
    await driver.close();
    console.log("Neo4j connection closed.");
  }
};

module.exports = {
  initNeo4j,
  getNeo4jSession,
  closeNeo4j
};
