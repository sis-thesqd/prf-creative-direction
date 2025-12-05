/**
 * Upload API Service
 *
 * API service for uploading files to S3.
 */

import type { CreativeDirectionApiConfig, UploadResponse } from '../../types/creativeDirection';

const DEFAULT_ENDPOINT = '/api/creative-direction/upload';

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Upload a file to S3
 */
export async function uploadFile(
    file: File,
    config: CreativeDirectionApiConfig = {},
    description?: string,
    onProgress?: (progress: number) => void
): Promise<UploadResponse> {
    const endpoint = config.uploadEndpoint || DEFAULT_ENDPOINT;

    try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);

        // Start progress
        onProgress?.(10);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                data: base64Data,
                description,
            }),
        });

        // Upload complete
        onProgress?.(90);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                data: null,
                error: errorData.error || `Upload failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        onProgress?.(100);

        return {
            data: data.data,
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to upload file',
        };
    }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
    files: File[],
    config: CreativeDirectionApiConfig = {},
    onFileProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResponse[]> {
    const results: UploadResponse[] = [];

    for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i], config, undefined, (progress) => {
            onFileProgress?.(i, progress);
        });
        results.push(result);
    }

    return results;
}
