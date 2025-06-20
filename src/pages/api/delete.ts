import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import path from 'path';
import { getFileUploadPaths } from '../../utils/file-helpers';

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
        // Get file paths helper
        const fileHelper = getFileUploadPaths();
        
        // Get all possible paths where the file might exist
        const possiblePaths = fileHelper.getAllPossiblePaths(submission.photoPath);
        
        // Try to delete from each possible location
        let deleted = false;
        
        for (const photoPath of possiblePaths) {
          try {
            await unlink(photoPath);
            console.log(`Successfully deleted file: ${photoPath}`);
            deleted = true;
            break; // Stop after first successful deletion
          } catch (fileError) {
            console.log(`File not found at: ${photoPath}`);
          }
        }
        
        if (!deleted) {
          console.warn(`Could not find file to delete: ${submission.photoPath}`);
        }
      } catch (err) {
        console.error('Error in file deletion process:', err);
        // Continue with database deletion even if file removal fails
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
