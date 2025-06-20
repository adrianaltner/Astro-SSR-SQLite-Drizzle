import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { writeFile, mkdir, access } from 'fs/promises';
import { createId } from '../../db/utils';
import path from 'path';

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
    // Create uploads directory if it doesn't exist
    const uploadDir = './public/uploads';
    
    try {
      await access(uploadDir);
    } catch {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(photo.name);
    const fileName = `${createId()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const arrayBuffer = await photo.arrayBuffer();
    await writeFile(filePath, new Uint8Array(arrayBuffer));

    // Return relative path for database
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Photo save error:', error);
    return null;
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
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
    const newSubmission = await db.insert(schema.submissions)
      .values({
        name,
        email,
        message,
        photoPath: photoPath || null, // Use the photoPath field with null as fallback
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
};

// Optional: GET endpoint to retrieve submissions
export const GET: APIRoute = async () => {
  try {
    const submissions = await db.select().from(schema.submissions).limit(100);
    
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
};
