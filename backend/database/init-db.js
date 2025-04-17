/**
 * Database Initialization Script
 *
 * This script initializes the blood bank database with schema and sample data.
 * Run it with Node.js to create database tables and populate initial data.
 */

require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function initializeDatabase() {
  console.log("Starting database initialization...");

  // Create connection to MySQL (without specifying database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "At1252005#",
    multipleStatements: true, // Allow multiple SQL statements
  });

  try {
    // Read schema SQL file
    const schemaPath = path.join(__dirname, "Schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Execute schema script
    console.log("Creating database schema and inserting sample data...");
    await connection.query(schemaSql);
    console.log("Schema and sample data created successfully!");
    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await connection.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => console.log("Done!"))
  .catch((err) => console.error("Failed to initialize database:", err));
