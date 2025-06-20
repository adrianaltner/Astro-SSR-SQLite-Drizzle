import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { writeFile } from 'fs/promises';
import { createId } from '../../db/utils';
import path from 'path';
import { getFileUploadPaths } from '../../utils/file-helpers';
import { getAuthFromRequest, authMiddleware } from '../../utils/session';
import { eq } from 'drizzle-orm';
import type { Submission } from '../../db/schema';

// Type for request data validation
interface SubmissionData {
  name: string;
  email: string;
  message: string;
  photo?: File;
}

// Validation function for FormData
const validateFormData = (formData: FormData): { valid: boolean; error?: string; data?: SubmissionData } => {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const photo = formData.get('photo') as File | null;

  // Check required fields
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Name is required' };
  }

  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!message || message.trim() === '') {
    return { valid: false, error: 'Message is required' };
  }

  // Photo validation (optional)
  if (photo && photo.size > 0) {
    // Check file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Photo must be smaller than 5MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(photo.type)) {
      return { valid: false, error: 'Photo must be JPEG, PNG, or WebP format' };
    }
  }

  // Return valid data
  return {
    valid: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      photo: photo && photo.size > 0 ? photo : undefined
    }
  };
};

// Validation function for JSON data (backward compatibility)
const validateData = (data: unknown): { valid: boolean; error?: string; data?: SubmissionData } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }

  const submission = data as Partial<SubmissionData>;

  // Check required fields
  if (!submission.name || typeof submission.name !== 'string' || submission.name.trim() === '') {
    return { valid: false, error: 'Name is required' };
  }

  if (!submission.email || typeof submission.email !== 'string' || submission.email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(submission.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!submission.message || typeof submission.message !== 'string' || submission.message.trim() === '') {
    return { valid: false, error: 'Message is required' };
  }

  // Return valid data
  return {
    valid: true,
    data: {
      name: submission.name.trim(),
      email: submission.email.trim(),
      message: submission.message.trim()
    }
  };
};

// Function to save photo
const savePhoto = async (photo: File): Promise<string | null> => {
  try {
    // Get file paths helper
    const fileHelper = getFileUploadPaths();
    
    // Ensure uploads directory exists
    await fileHelper.ensureUploadsDir();

    // Generate unique filename
    const fileExtension = path.extname(photo.name);
    const fileName = `${createId()}${fileExtension}`;
    
    // Create full file path
    const filePath = path.join(fileHelper.uploadsDir, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await photo.arrayBuffer();
    await writeFile(filePath, new Uint8Array(arrayBuffer));
    
    console.log(`File saved successfully to: ${filePath}`);

    // Return relative path for database (same for both environments)
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Photo save error:', error);
    return null;
  }
};

export const POST: APIRoute = async (context) => {
  // Use the authentication middleware
  return authMiddleware(context, async (authState) => {
    try {
      const { request } = context;
      // Check if request contains multipart/form-data (for file uploads)
      const contentType = request.headers.get('content-type') || '';
      
      let validationResult;

      if (contentType.includes('multipart/form-data')) {
        // Handle FormData (with potential file upload)
        const formData = await request.formData();
        validationResult = validateFormData(formData);
      } else {
        // Handle JSON (backward compatibility)
        const requestData = await request.json();
        validationResult = validateData(requestData);
      }
      
      if (!validationResult.valid || !validationResult.data) {
        return new Response(
          JSON.stringify({ success: false, error: validationResult.error }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

    const { name, email, message, photo } = validationResult.data;

    // Save photo if provided
    let photoPath: string | null = null;
    if (photo) {
      photoPath = await savePhoto(photo);
      if (!photoPath) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to save photo' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert data into database
    // Create a new date for the timestamp and ensure it's in the correct timezone
    const createdAt = new Date();
    
    // Get user information from auth state
    // Make sure the user ID is properly set as a required field
    if (!authState.user?.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User authentication failed or user ID is missing' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const newSubmission = await db.insert(schema.submissions)
      .values({
        name,
        email,
        message,
        photoPath: photoPath || null, // Use the photoPath field with null as fallback
        createdAt: createdAt, // Explicitly set the timestamp
        userId: authState.user.id // Associate with the logged-in user (guaranteed to exist)
      })
      .returning()
      .get();
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: newSubmission,
        message: `Submission saved${photoPath ? ' with photo' : ''}`
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Submission error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred while processing your submission' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  });
};

// Optional: GET endpoint to retrieve submissions
export const GET: APIRoute = async (context) => {
  // Use authentication middleware
  return authMiddleware(context, async (authState) => {
    try {
      // Get user information from auth state
      const userId = authState.user?.id;
      const isAdmin = authState.user?.role === 'admin';
      
      // Variable to hold submissions with explicit type
      let submissions: Submission[] = [];
      
      if (isAdmin) {
        // Admins can see all submissions
        submissions = await db.select().from(schema.submissions).limit(100);
      } else if (userId) {
        // Regular users can only see their own submissions
        submissions = await db
          .select()
          .from(schema.submissions)
          .where(eq(schema.submissions.userId, userId))
          .limit(100);
      }
      // If neither condition is met, submissions remains an empty array
      
      return new Response(
        JSON.stringify({ success: true, data: submissions }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Get submissions error:', error);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve submissions' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  });
};
