// Upload service - API calls for file upload operations

const API_BASE_URL = "http://localhost:8090/api";

export interface UploadResponse {
    image_path: string;
    filename: string;
}

/**
 * Uploads an image file to the server
 * @param file The image file to upload
 * @returns Promise containing the upload response with image path
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: "POST",
            credentials: "include",
            body: formData
            // Note: Don't set Content-Type header manually for multipart/form-data
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
        }

        const data: UploadResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Validates if a file is a valid image type
 * @param file The file to validate
 * @returns Boolean indicating if file is valid
 */
export function validateImageFile(file: File): boolean {
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp'
    ];
    
    // Check file type
    if (!validTypes.includes(file.type)) {
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
}

/**
 * Get file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}