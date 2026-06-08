#!/usr/bin/env node

/**
 * Database Migration Script
 * This script runs complete_schema.sql to set up the entire database
 * Run this after drop-all.js or on a fresh database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { loadEnv, getDbConfig } = require('./db-env');

loadEnv();
const dbConfig = getDbConfig();
const pool = new Pool(dbConfig);

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}`);

    // Ensure UTF-8 encoding so Kurdish text is preserved
    await client.query("SET client_encoding TO 'UTF8'");
    
    // Read complete_schema.sql file
    const sqlFile = path.join(__dirname, '../src/schemas/complete_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Reading complete_schema.sql...');
    
    // Execute SQL
    console.log('⚡ Creating tables, functions, triggers, and policies...');
    await client.query(sql);
    
    console.log('✅ Database migration completed successfully!');
    console.log('💡 All tables, functions, triggers, and policies have been created.');
    
  } catch (error) {
    console.error('❌ Error during database migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
