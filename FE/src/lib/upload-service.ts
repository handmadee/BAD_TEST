import { apiClient } from "./api-client";
import { ApiResponse } from "@/types/api";

export interface UploadResponse {
    fileName: string;
    fileUrl: string;
    originalName: string;
    size: string;
}

export class UploadService {
    /**
     * Upload hình ảnh
     */
    async uploadImage(
        file: File,
        type: "court" | "user" | "post" = "post"
    ): Promise<ApiResponse<UploadResponse>> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", type);

            return await apiClient.post<UploadResponse>(
                "/upload/image",
                formData
            );
        } catch (error) {
            console.error("Upload image error:", error);
            throw error;
        }
    }

    /**
     * Upload nhiều hình ảnh
     */
    async uploadMultipleImages(
        files: File[],
        type: "court" | "user" | "post" = "post"
    ): Promise<ApiResponse<UploadResponse>[]> {
        try {
            const promises = files.map((file) => this.uploadImage(file, type));
            return await Promise.all(promises);
        } catch (error) {
            console.error("Upload multiple images error:", error);
            throw error;
        }
    }

    /**
     * Xóa hình ảnh
     */
    async deleteImage(
        subDir: string,
        fileName: string
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(
                `/upload/images/${subDir}/${fileName}`
            );
        } catch (error) {
            console.error("Delete image error:", error);
            throw error;
        }
    }

    /**
     * Validate file trước khi upload
     */
    validateImageFile(file: File): { valid: boolean; error?: string } {
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return { valid: false, error: "File quá lớn. Tối đa 10MB" };
        }

        // Check file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
        ];
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: "Chỉ hỗ trợ file hình ảnh: JPG, PNG, GIF",
            };
        }

        return { valid: true };
    }

    /**
     * Tạo preview URL cho file
     */
    createPreviewUrl(file: File): string {
        return URL.createObjectURL(file);
    }

    /**
     * Thu hồi preview URL
     */
    revokePreviewUrl(url: string): void {
        URL.revokeObjectURL(url);
    }
}

// Singleton instance
export const uploadService = new UploadService();

// Helper functions
export const uploadImage = (file: File, type?: "court" | "user" | "post") =>
    uploadService.uploadImage(file, type);

export const uploadMultipleImages = (
    files: File[],
    type?: "court" | "user" | "post"
) => uploadService.uploadMultipleImages(files, type);

export const validateImageFile = (file: File) =>
    uploadService.validateImageFile(file);

export const createPreviewUrl = (file: File) =>
    uploadService.createPreviewUrl(file);

export const revokePreviewUrl = (url: string) =>
    uploadService.revokePreviewUrl(url);
