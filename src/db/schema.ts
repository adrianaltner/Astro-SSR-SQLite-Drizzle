import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from './utils';

// Define a users table for authentication and user management
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: text('role').default('user').notNull(), // 'user', 'admin', etc.
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

// Define types for user schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Define a submissions table for storing form data
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
    // Foto-Pfade als JSON oder einzelne Felder
  photoPath: text('photo_path'), // Einzelnes Foto
  photoPaths: text('photo_paths', { mode: 'json' }).$type<string[]>(), // Mehrere Fotos
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  userId: text('user_id').references(() => users.id), // Reference to the user who created the submission
});

// Define types for our schema
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
