const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1")
    ? false
    : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false)
});

pool.on("error", (err) => console.error("Unexpected PostgreSQL pool error:", err.message));
module.exports = { pool };
