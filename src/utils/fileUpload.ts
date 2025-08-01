export interface FileUploadResult {
    url: string;
    name: string;
    size: number;
    type: string;
    public_id: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

export class FileUploadService {
    private static instance: FileUploadService;

    static getInstance(): FileUploadService {
        if (!FileUploadService.instance) {
            FileUploadService.instance = new FileUploadService();
        }
        return FileUploadService.instance;
    }

    async uploadFile(file: File): Promise<FileUploadResult> {
        if (!this.validateFile(file)) {
            throw new Error('Invalid file type or size');
        }

        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload/single`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend upload error:', errorData);
                throw new Error(errorData.message || 'Failed to upload file.');
            }

            const data = await response.json();
            console.log('Backend upload response:', data);

            const uploadResult: FileUploadResult = {
                url: data.url,
                name: file.name,
                size: file.size,
                type: file.type,
                public_id: data.public_id
                // You might also want to store data.public_id if you need to delete files later
            };

            return uploadResult;

        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }

    async uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]> {
        if (files.length === 0) {
            return [];
        }

        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend multiple upload error:', errorData);
                throw new Error(errorData.message || 'Failed to upload multiple files to backend.');
            }

            const data = await response.json();
            console.log('Backend multiple upload response:', data);

            const uploadedResults: FileUploadResult[] = data.results.map((result: any, index: number) => {
                const originalFile = files[index]; // Use the index to match
                if (!originalFile) {
                    return {
                        url: result.url,
                        name: 'unknown',
                        size: 0,
                        type: result.fileType,
                        public_id: result.public_id
                    };
                }
                return {
                    url: result.url,
                    name: originalFile.name,
                    size: originalFile.size,
                    type: originalFile.type,
                    public_id: result.public_id
                };
            });

            return uploadedResults;

        } catch (error) {
            console.error('Error during multiple file upload:', error);
            throw error;
        }
    }

    private validateFile(file: File): boolean {
        const maxSize = 5 * 1024 * 1024; // Frontend max 5MB
        if (file.size > maxSize) {
            return false;
        }

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

}

export const fileUploadService = FileUploadService.getInstance();