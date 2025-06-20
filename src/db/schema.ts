import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from './utils';

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
});

// Define types for our schema
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
