import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// Ensure upload directory exists
export async function ensureUploadDir(dir: string = './uploads'): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${random}_${sanitized}`;
}

// Save file to disk
export async function saveFile(buffer: Buffer, fileName: string, uploadDir: string = './uploads'): Promise<string> {
  await ensureUploadDir(uploadDir);
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}