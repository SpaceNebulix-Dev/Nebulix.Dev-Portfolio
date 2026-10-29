require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const { pool } = require("./db");

(async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password || password === "change_this_to_a_long_unique_password") {
      throw new Error("Set ADMIN_USERNAME and a strong ADMIN_PASSWORD in .env before initializing.");
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [username, hash]
    );
    console.log("Database tables are ready. Admin account created if it did not already exist.");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
