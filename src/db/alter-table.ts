import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { join } from 'path';

// Database file path
const DB_PATH = join(process.cwd(), 'database.db');

async function alterTable() {
  try {
    console.log('Altering database table...');
    console.log(`Database path: ${DB_PATH}`);
    
    // Create SQLite database connection
    const sqlite = new Database(DB_PATH);
    
    // Create Drizzle ORM instance
    const db = drizzle(sqlite);
    
    // Check if photo_path column exists
    console.log('Checking if photo_path column exists...');
    const tableInfo = sqlite.prepare('PRAGMA table_info(submissions)').all() as any[];
    const photoPathExists = tableInfo.some(col => col.name === 'photo_path');
    
    if (!photoPathExists) {
      console.log('Adding photo_path column to submissions table...');
      
      // Add the photo_path column
      db.run(sql`
        ALTER TABLE submissions 
        ADD COLUMN photo_path TEXT;
      `);
      
      console.log('Added photo_path column successfully!');
    } else {
      console.log('photo_path column already exists.');
    }

    // Check if photo_paths column exists
    const photoPathsExists = tableInfo.some(col => col.name === 'photo_paths');
    
    if (!photoPathsExists) {
      console.log('Adding photo_paths column to submissions table...');
      
      // Add the photo_paths column
      db.run(sql`
        ALTER TABLE submissions 
        ADD COLUMN photo_paths TEXT;
      `);
      
      console.log('Added photo_paths column successfully!');
    } else {
      console.log('photo_paths column already exists.');
    }
    
    console.log('Database table alteration completed successfully!');
    
    // Close connection
    sqlite.close();
    
    return { success: true };
  } catch (error) {
    console.error('Database table alteration failed:', error);
    return { success: false, error };
  }
}

// Run the function
alterTable();
