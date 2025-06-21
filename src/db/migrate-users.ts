import { db } from './index';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'path';

// Path to migration files
const migrationsFolder = resolve('./drizzle');

// Run migrations
console.log('Running migrations...');
migrate(db, { migrationsFolder });
console.log('Migrations complete!');
