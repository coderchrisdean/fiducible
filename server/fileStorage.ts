import { promises as fs } from 'fs';
import path from 'path';
import mimeTypes from 'mime-types';

export interface FileStorageInterface {
  saveFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<boolean>;
  getFileUrl(filePath: string): string;
}

export class LocalFileStorage implements FileStorageInterface {
  private uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async saveFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = mimeTypes.extension(mimeType) || 'bin';
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  getFileUrl(filePath: string): string {
    // For local storage, return relative path for serving static files
    return filePath.replace(this.uploadDir, '/uploads');
  }
}

// File validation utilities
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: any): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
}

export function generateSearchText(fileName: string, mimeType: string): string {
  // Basic text extraction - in production would use libraries like pdf-parse
  const baseName = path.basename(fileName, path.extname(fileName));
  return baseName.replace(/[_-]/g, ' ').toLowerCase();
}