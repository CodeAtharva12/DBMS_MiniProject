const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

try {
  // Create a connection pool
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blood_bank_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 seconds timeout
  });

  // Test the connection
  console.log('Attempting to connect to MySQL database...');
  pool.getConnection()
    .then(connection => {
      console.log('✅ Database connection established successfully');
      connection.release();
    })
    .catch(err => {
      console.error('❌ Error connecting to database:', err.message);
      console.log('\n📋 MySQL Setup Instructions:');
      console.log('1. Make sure MySQL server is installed and running');
      console.log('2. Create a database named "blood_bank_system"');
      console.log('3. Check your .env file for correct credentials');
      console.log('4. Run "node database/init-db.js" to initialize the database schema\n');
    });
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  // Create a mock pool that will provide clear errors when used
  pool = {
    execute: async () => {
      throw new Error('Database connection not available. Please install and configure MySQL.');
    },
    query: async () => {
      throw new Error('Database connection not available. Please install and configure MySQL.');
    },
    getConnection: async () => {
      throw new Error('Database connection not available. Please install and configure MySQL.');
    }
  };
}

module.exports = pool;