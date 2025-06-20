import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join } from 'path';

// Database file path - store in project root
const DB_PATH = join(process.cwd(), 'database.db');

// Create SQLite database connection
// Use verbose: console.log for debugging - can be removed in production
const sqlite = new Database(DB_PATH, { verbose: console.log });

// Create Drizzle ORM instance with our schema
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export { schema };
