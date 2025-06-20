import path from 'path';
import fs from 'fs/promises';

/**
 * Gets the appropriate upload directory based on environment
 * @returns Object with paths and helper methods for file operations
 */
export const getFileUploadPaths = () => {
  // Determine if we're in production
  const isProd = import.meta.env.PROD;
  
  // Set base directories
  const baseDir = isProd ? './dist/client' : './public';
  const uploadsDir = path.join(baseDir, 'uploads');
  
  return {
    baseDir,
    uploadsDir,
    
    /**
     * Ensures the uploads directory exists
     */
    async ensureUploadsDir() {
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
        console.log(`Created uploads directory: ${uploadsDir}`);
      }
    },
    
    /**
     * Gets the full system path for a file based on its relative URL path
     * @param urlPath The relative URL path (e.g. /uploads/file.jpg)
     * @returns The full system path
     */
    getSystemPath(urlPath: string) {
      const relativePath = urlPath.startsWith('/') 
        ? urlPath.substring(1) 
        : urlPath;
      
      return path.join(process.cwd(), baseDir, relativePath);
    },
    
    /**
     * Gets all possible file paths where a file might exist
     * @param urlPath The relative URL path (e.g. /uploads/file.jpg)
     * @returns Array of possible system paths
     */
    getAllPossiblePaths(urlPath: string) {
      const relativePath = urlPath.startsWith('/') 
        ? urlPath.substring(1) 
        : urlPath;
      
      const paths = [
        path.join(process.cwd(), baseDir, relativePath),
      ];
      
      // Add fallback path in case the file was saved to public in prod
      if (isProd) {
        paths.push(path.join(process.cwd(), 'public', relativePath));
      }
      
      return paths;
    },
    
    /**
     * Converts a File object to a Buffer
     * @param file The File object
     * @returns Buffer containing file data
     */
    async fileToBuffer(file: File) {
      return Buffer.from(await file.arrayBuffer());
    }
  };
};
