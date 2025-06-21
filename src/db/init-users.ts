import { db } from './index';

// SQL to create the users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL,
    last_login INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1
  );
`;

// Execute the SQL
console.log('Creating users table...');
db.run(createUsersTable);
console.log('Users table created successfully!');
