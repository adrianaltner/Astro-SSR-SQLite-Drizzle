import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { join } from 'path';

// Database file path
const DB_PATH = join(process.cwd(), 'database.db');
// Migrations folder path
const MIGRATIONS_PATH = join(process.cwd(), 'drizzle');

// Migration function
async function runMigration() {
  try {
    console.log('Starting database migrations...');
    console.log(`Database path: ${DB_PATH}`);
    console.log(`Migrations path: ${MIGRATIONS_PATH}`);
    
    // Create SQLite database connection
    const sqlite = new Database(DB_PATH);
    
    // Create Drizzle ORM instance
    const db = drizzle(sqlite);
    
    // Run migrations
    console.log('Running migrations...');
    migrate(db, { migrationsFolder: MIGRATIONS_PATH });
    
    console.log('Migrations completed successfully!');
    
    // Close connection
    sqlite.close();
    
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}

// Run migration
runMigration();
