import type { APIRoute } from 'astro';
import { registerUser, checkUserAvailability } from '../../utils/auth';

// Interface for request body validation
interface RegistrationData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

// Validate user registration data
function validateRegistration(data: unknown): { valid: boolean; error?: string; data?: RegistrationData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }

  const registration = data as Partial<RegistrationData>;

  // Validate username
  if (!registration.username || typeof registration.username !== 'string' || registration.username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }

  if (registration.username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  // Validate email
  if (!registration.email || typeof registration.email !== 'string' || registration.email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registration.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Validate password
  if (!registration.password || typeof registration.password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (registration.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  // Validate optional fields
  if (registration.fullName !== undefined && typeof registration.fullName !== 'string') {
    return { valid: false, error: 'Full name must be a string' };
  }

  // Return valid data
  return {
    valid: true,
    data: {
      username: registration.username.trim(),
      email: registration.email.trim().toLowerCase(),
      password: registration.password,
      fullName: registration.fullName?.trim()
    }
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const validationResult = validateRegistration(body);

    if (!validationResult.valid || !validationResult.data) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { username, email, password, fullName } = validationResult.data;

    // Check if username or email already exists
    const availability = await checkUserAvailability(username, email);
    
    if (!availability.usernameAvailable) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is already taken' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!availability.emailAvailable) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Register the new user
    const newUser = await registerUser(username, email, password, fullName);

    if (!newUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to register user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName
        },
        message: 'User registered successfully'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during registration'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
