const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduquery_db';
    const maskedConnStr = connStr.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log(`[MongoDB] Connecting to: ${maskedConnStr}`);
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // We log error but do not exit hard so server can respond with clear status messages if DB is offline
  }
};

module.exports = connectDB;
