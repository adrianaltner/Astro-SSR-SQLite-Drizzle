import type { APIRoute } from 'astro';

// Helper function to clear the session cookie
const getExpiredCookie = (): string => {
  return 'user_session=deleted; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// POST request handler for API-based logout
export const POST: APIRoute = async ({ request }) => {
  // Clear the session cookie by setting it to expire in the past
  const expiredCookie = getExpiredCookie();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Logged out successfully'
    }),
    { 
      status: 200, 
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': expiredCookie
      }
    }
  );
};

// GET request handler for link-based logout
export const GET: APIRoute = async ({ request, redirect }) => {
  // Clear the session cookie by setting it to expire in the past
  const expiredCookie = getExpiredCookie();
  
  // Extract the redirect URL from the query parameters, if provided
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/';
  
  // Redirect the user to the homepage or specified redirect URL
  // Create Response with redirect and cookie
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectTo,
      'Set-Cookie': expiredCookie
    }
  });
};
