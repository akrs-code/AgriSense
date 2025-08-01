export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export class FileUploadService {
  private static instance: FileUploadService;
  private uploadedFiles: Map<string, FileUploadResult> = new Map();

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  async uploadFile(file: File): Promise<FileUploadResult> {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!this.validateFile(file)) {
        reject(new Error('Invalid file type or size'));
        return;
      }

      // Create file reader
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        const fileId = this.generateFileId();

        const uploadResult: FileUploadResult = {
          url: result, // Base64 data URL for demo
          name: file.name,
          size: file.size,
          type: file.type
        };

        // Store in memory (in real app, this would upload to cloud storage)
        this.uploadedFiles.set(fileId, uploadResult);

        // Simulate upload delay
        setTimeout(() => {
          resolve(uploadResult);
        }, 500);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  async uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  private validateFile(file: File): boolean {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    return allowedTypes.includes(file.type);
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get file by ID (for demo purposes)
  getFile(fileId: string): FileUploadResult | undefined {
    return this.uploadedFiles.get(fileId);
  }

  // Delete file
  deleteFile(fileId: string): boolean {
    return this.uploadedFiles.delete(fileId);
  }
}

export const fileUploadService = FileUploadService.getInstance();