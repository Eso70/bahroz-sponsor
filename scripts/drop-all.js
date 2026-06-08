#!/usr/bin/env node

/**
 * Drop All Database Objects Script
 * This script runs drop_all.sql to completely reset the database
 * WARNING: This will delete ALL data, tables, functions, triggers, and policies!
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { loadEnv, getDbConfig } = require('./db-env');

loadEnv();
const dbConfig = getDbConfig();
const pool = new Pool(dbConfig);

async function dropAll() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting database cleanup...');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}`);
    
    // Read drop_all.sql file
    const sqlFile = path.join(__dirname, '../src/schemas/drop_all.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Reading drop_all.sql...');
    
    // Execute SQL
    console.log('⚡ Executing DROP statements...');
    await client.query(sql);
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('💡 All tables, functions, triggers, and policies have been dropped.');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  dropAll()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { dropAll };
