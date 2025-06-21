import type { APIRoute } from 'astro';
import { loginUser } from '../../utils/auth';
import { createSessionCookie } from '../../utils/session';

// Interface for request body validation
interface LoginData {
  usernameOrEmail: string;
  password: string;
}

// Validate login data
function validateLogin(data: unknown): { valid: boolean; error?: string; data?: LoginData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }

  const login = data as Partial<LoginData>;

  // Validate username or email
  if (!login.usernameOrEmail || typeof login.usernameOrEmail !== 'string' || login.usernameOrEmail.trim() === '') {
    return { valid: false, error: 'Username or email is required' };
  }

  // Validate password
  if (!login.password || typeof login.password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  // Return valid data
  return {
    valid: true,
    data: {
      usernameOrEmail: login.usernameOrEmail.trim(),
      password: login.password
    }
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const validationResult = validateLogin(body);

    if (!validationResult.valid || !validationResult.data) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { usernameOrEmail, password } = validationResult.data;

    // Attempt to login
    const user = await loginUser(usernameOrEmail, password);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid username/email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a session cookie
    const sessionCookie = createSessionCookie(user.id);
    
    // Return success response with session cookie
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        message: 'Login successful'
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie
        } 
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during login'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
