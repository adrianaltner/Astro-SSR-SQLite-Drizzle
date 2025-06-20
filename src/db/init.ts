import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { join } from 'path';

// Database file path
const DB_PATH = join(process.cwd(), 'database.db');

async function initDatabase() {
  try {
    console.log('Initializing database...');
    console.log(`Database path: ${DB_PATH}`);
    
    // Create SQLite database connection
    const sqlite = new Database(DB_PATH);
    
    // Create Drizzle ORM instance
    const db = drizzle(sqlite);
    
    // Create submissions table if it doesn't exist
    console.log('Creating submissions table if it doesn\'t exist...');
    
    db.run(sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    
    console.log('Database initialization completed successfully!');
    
    // Close connection
    sqlite.close();
    
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
}

// Run initialization
initDatabase();
