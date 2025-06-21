import { db } from './index';

// SQL to add userId column to submissions table
const alterSubmissionsTable = `
  ALTER TABLE submissions 
  ADD COLUMN user_id TEXT REFERENCES users(id);
`;

// Execute the SQL
console.log('Altering submissions table to add user_id foreign key...');

try {
  db.run(alterSubmissionsTable);
  console.log('Submissions table altered successfully!');
} catch (error: any) {
  console.error('Error altering submissions table:', error);
  
  // Check if error is due to column already existing
  if (error?.message && typeof error.message === 'string' && error.message.includes('duplicate column name')) {
    console.log('The user_id column already exists in submissions table.');
  }
}
