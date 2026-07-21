// db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'er_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDB() {
  try {
    const connection = await pool.getConnection();

    // Create Patients Table (only if it doesn't exist — your data is safe now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT,
        gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
        department VARCHAR(50) DEFAULT 'General',
        chief_complaint TEXT,
        urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        status ENUM('waiting', 'admitted', 'treatment', 'discharged') DEFAULT 'waiting',
        admission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        treatment_start_time TIMESTAMP NULL,
        discharge_time TIMESTAMP NULL,
        assigned_staff_id VARCHAR(36) NULL
      )
    `);

    // If the table already existed with the old ENUM (without 'admitted'),
    // this ALTER will safely add it
    await connection.query(`
      ALTER TABLE patients MODIFY COLUMN status
      ENUM('waiting', 'admitted', 'treatment', 'discharged') DEFAULT 'waiting'
    `);

    // Create Staff Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role ENUM('doctor', 'nurse', 'admin') NOT NULL,
        is_active BOOLEAN DEFAULT true
      )
    `);

    console.log("Database tables initialized successfully!");
    connection.release();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDB();

export default pool;
