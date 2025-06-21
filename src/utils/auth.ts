import crypto from 'crypto';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Hash a password using PBKDF2 with a random salt
 * @param password The plain text password to hash
 * @returns The hashed password with salt in format hash:salt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with PBKDF2
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      
      // Return hash:salt format to store in database
      resolve(`${derivedKey.toString('hex')}:${salt}`);
    });
  });
}

/**
 * Verify a password against a stored hash
 * @param password The plain text password to verify
 * @param storedHash The stored password hash in format hash:salt
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Extract the salt from the stored hash
    const [hash, salt] = storedHash.split(':');
    
    // If missing parts, password can't be verified
    if (!hash || !salt) {
      resolve(false);
      return;
    }
    
    // Hash the provided password with the same salt
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        resolve(false);
        return;
      }
      
      // Compare the hashes
      const newHash = derivedKey.toString('hex');
      resolve(newHash === hash);
    });
  });
}

/**
 * Register a new user
 * @param username Username (must be unique)
 * @param email Email address (must be unique)
 * @param password Plain text password
 * @param fullName Optional full name
 * @returns The created user object (without password)
 */
export async function registerUser(
  username: string, 
  email: string, 
  password: string, 
  fullName?: string
): Promise<Omit<schema.User, 'passwordHash'> | null> {
  try {
    // Hash the password
    const passwordHash = await hashPassword(password);
    
    // Insert the new user
    const newUser = await db.insert(schema.users)
      .values({
        username,
        email,
        passwordHash,
        fullName,
      })
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        fullName: schema.users.fullName,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
        lastLogin: schema.users.lastLogin,
        isActive: schema.users.isActive
      })
      .get();
      
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

/**
 * Login a user
 * @param usernameOrEmail Username or email
 * @param password Plain text password
 * @returns User object if authentication succeeds, null otherwise
 */
export async function loginUser(
  usernameOrEmail: string,
  password: string
): Promise<Omit<schema.User, 'passwordHash'> | null> {
  try {
    // Find the user by username or email
    const user = await db.query.users.findFirst({
      where: (users) => {
        const isUsername = eq(users.username, usernameOrEmail);
        const isEmail = eq(users.email, usernameOrEmail);
        return isUsername || isEmail;
      }
    });
    
    if (!user) {
      return null; // User not found
    }
    
    // Verify the password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return null; // Invalid password
    }
    
    // Update the last login time
    await db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, user.id));
    
    // Return the user without the password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
}

/**
 * Get user by ID
 * @param userId User ID
 * @returns User object without password hash
 */
export async function getUserById(
  userId: string
): Promise<Omit<schema.User, 'passwordHash'> | null> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });
    
    if (!user) return null;
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Check if username or email already exists
 * @param username Username to check
 * @param email Email to check
 * @returns Object with username and email availability
 */
export async function checkUserAvailability(
  username: string, 
  email: string
): Promise<{ usernameAvailable: boolean, emailAvailable: boolean }> {
  try {
    const existingUsername = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    
    const existingEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    
    return {
      usernameAvailable: !existingUsername,
      emailAvailable: !existingEmail
    };
  } catch (error) {
    console.error('Error checking user availability:', error);
    // If there's an error, assume not available to be safe
    return { usernameAvailable: false, emailAvailable: false };
  }
}
