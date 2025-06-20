import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the JSON request body
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Submission ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First, get the submission to check if it has a photo
    const submission = await db.query.submissions.findFirst({
      where: eq(schema.submissions.id, id)
    });

    if (!submission) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Submission not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If the submission has a photo, delete it from the file system
    if (submission.photoPath) {
      try {
        // Convert the relative URL path to a system path
        const relativePath = submission.photoPath.startsWith('/') 
          ? submission.photoPath.substring(1) // Remove leading slash if present
          : submission.photoPath;
        const photoPath = path.join(process.cwd(), 'public', relativePath);
        
        await unlink(photoPath);
      } catch (err) {
        console.error('Error deleting photo file:', err);
        // Continue with deletion even if file removal fails
      }
    }

    // Delete the submission from database
    await db.delete(schema.submissions)
      .where(eq(schema.submissions.id, id));

    return new Response(JSON.stringify({
      success: true,
      message: 'Submission deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete submission'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
