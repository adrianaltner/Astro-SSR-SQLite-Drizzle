import type { APIContext } from 'astro';
import { getUserById } from './auth';
import type { User } from '../db/schema';

/**
 * Authentication state with user info
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: Omit<User, 'passwordHash'> | null;
  error?: string;
}

/**
 * Get the session cookie from request
 */
export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('user_session='));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

/**
 * Get authentication state from the request
 * @param request The request object
 * @returns AuthState object with authentication info
 */
export async function getAuthFromRequest(request: Request): Promise<AuthState> {
  try {
    // Get session cookie
    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
      return { isAuthenticated: false, user: null };
    }
    
    // Decode the session (simple encoding for this example, consider JWT for production)
    const [sessionId, userId] = Buffer.from(sessionCookie, 'base64').toString().split(':');
    
    if (!sessionId || !userId) {
      return { isAuthenticated: false, user: null, error: 'Invalid session format' };
    }
    
    // Get user data
    const user = await getUserById(userId);
    
    if (!user) {
      return { isAuthenticated: false, user: null, error: 'User not found' };
    }
    
    return { isAuthenticated: true, user };
  } catch (error) {
    console.error('Auth error:', error);
    return { isAuthenticated: false, user: null, error: 'Authentication error' };
  }
}

/**
 * Create a session cookie for the user
 * @param userId User ID to include in session
 * @returns Session cookie string
 */
export function createSessionCookie(userId: string): string {
  // Create a simple session ID (use a more robust method in production)
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  // Create session string (sessionId:userId)
  const sessionData = `${sessionId}:${userId}`;
  
  // Encode as base64
  const sessionCookie = Buffer.from(sessionData).toString('base64');
  
  // Set cookie expiration for 7 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  
  return `user_session=${sessionCookie}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

/**
 * Authentication middleware for API routes
 * @param context Astro API context
 * @param callback Callback function for authenticated requests
 * @returns Response object
 */
export async function authMiddleware(
  context: APIContext,
  callback: (authState: AuthState) => Promise<Response>
): Promise<Response> {
  const { request } = context;
  const authState = await getAuthFromRequest(request);
  
  if (!authState.isAuthenticated) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication required',
        redirectTo: '/login'
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return callback(authState);
}
