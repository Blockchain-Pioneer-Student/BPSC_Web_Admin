import { API_BASE_URL } from '@/config/enpoints';
import { tokenRefreshService } from './tokenRefresh';

export interface UploadResponse {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  format: string;
}

export class UploadService {
  private static baseUrl = API_BASE_URL;

  static async uploadImage(file: File): Promise<UploadResponse> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend
      let response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status === 401) {
        const refreshed = await tokenRefreshService.manualRefresh();
        if (refreshed) {
          response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  static async uploadMultipleImages(files: File[]): Promise<UploadResponse[]> {
    const uploads = files.map(file => this.uploadImage(file));
    return Promise.all(uploads);
  }
}