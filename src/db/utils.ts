import { customAlphabet } from 'nanoid';

// Create a custom ID generator using nanoid
// This generates IDs that are URL-safe, unique, and have a very low collision probability
export const createId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  15
);
