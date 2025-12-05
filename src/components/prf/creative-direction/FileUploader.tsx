/**
 * FileUploader Component
 *
 * File upload component for creative direction assets with S3 integration.
 */

"use client";

import React, { useCallback, useState, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../../../services/api/upload';
import { cx } from '../../../utils/cx';
import type { FileUploaderProps, UploadedFile } from '../../../types/creativeDirection';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.psd', '.ai', '.eps'];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_FILES = 5;

interface FileUploadState {
    file: File;
    progress: number;
    error?: string;
    uploading: boolean;
}

function getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

function isAllowedExtension(filename: string): boolean {
    const ext = getFileExtension(filename);
    return ALLOWED_EXTENSIONS.includes(ext);
}

function isImageFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const suffixes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.floor(bytes / Math.pow(1024, i))} ${suffixes[i]}`;
}

export function FileUploader({
    files,
    fileDescriptions,
    onFilesChange,
    onDescriptionsChange,
    apiConfig,
    className,
    isDisabled = false,
}: FileUploaderProps) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<Map<string, FileUploadState>>(new Map());

    const handleFileSelect = useCallback(
        async (selectedFiles: FileList | null) => {
            if (!selectedFiles || isDisabled) return;

            const newFiles = Array.from(selectedFiles);
            const totalFiles = files.length + newFiles.length;

            if (totalFiles > MAX_FILES) {
                alert(`Maximum ${MAX_FILES} files allowed`);
                return;
            }

            for (const file of newFiles) {
                // Validate extension
                if (!isAllowedExtension(file.name)) {
                    alert(`File type not allowed: ${file.name}`);
                    continue;
                }

                // Validate size
                if (file.size > MAX_FILE_SIZE) {
                    alert(`File too large: ${file.name}. Maximum size is 2GB.`);
                    continue;
                }

                const fileId = `${Date.now()}-${file.name}`;

                // Add to uploading state
                setUploadingFiles(prev => new Map(prev).set(fileId, {
                    file,
                    progress: 0,
                    uploading: true,
                }));

                try {
                    const response = await uploadFile(file, apiConfig, undefined, (progress) => {
                        setUploadingFiles(prev => {
                            const newMap = new Map(prev);
                            const state = newMap.get(fileId);
                            if (state) {
                                newMap.set(fileId, { ...state, progress });
                            }
                            return newMap;
                        });
                    });

                    if (response.error || !response.data) {
                        setUploadingFiles(prev => {
                            const newMap = new Map(prev);
                            const state = newMap.get(fileId);
                            if (state) {
                                newMap.set(fileId, { ...state, uploading: false, error: response.error || 'Upload failed' });
                            }
                            return newMap;
                        });
                        continue;
                    }

                    // Success - add to files list
                    const uploadedFile: UploadedFile = {
                        id: fileId,
                        url: response.data.url,
                        filename: response.data.filename,
                        size: response.data.size,
                        type: file.type,
                    };

                    onFilesChange([...files, uploadedFile]);

                    // Remove from uploading state
                    setUploadingFiles(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(fileId);
                        return newMap;
                    });
                } catch (error) {
                    setUploadingFiles(prev => {
                        const newMap = new Map(prev);
                        const state = newMap.get(fileId);
                        if (state) {
                            newMap.set(fileId, { ...state, uploading: false, error: 'Upload failed' });
                        }
                        return newMap;
                    });
                }
            }
        },
        [files, onFilesChange, apiConfig, isDisabled]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isDisabled) {
            setIsDragging(true);
        }
    }, [isDisabled]);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileSelect(e.target.files);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [handleFileSelect]
    );

    const handleRemoveFile = useCallback(
        (fileId: string) => {
            onFilesChange(files.filter(f => f.id !== fileId));
            const newDescriptions = { ...fileDescriptions };
            delete newDescriptions[fileId];
            onDescriptionsChange(newDescriptions);
        },
        [files, fileDescriptions, onFilesChange, onDescriptionsChange]
    );

    const handleDescriptionChange = useCallback(
        (fileId: string, description: string) => {
            onDescriptionsChange({
                ...fileDescriptions,
                [fileId]: description,
            });
        },
        [fileDescriptions, onDescriptionsChange]
    );

    const handleRemoveUploading = useCallback((fileId: string) => {
        setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, []);

    return (
        <div className={cx('flex flex-col gap-4', className)}>
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-secondary">
                    Reference Files <span className="text-tertiary">(optional)</span>
                </label>
                <span className="text-xs text-tertiary">
                    {files.length}/{MAX_FILES} files
                </span>
            </div>

            {/* Drop zone */}
            {files.length < MAX_FILES && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cx(
                        'relative flex flex-col items-center gap-3 rounded-xl bg-primary px-6 py-4 text-tertiary ring-1 ring-secondary transition duration-100 ease-linear ring-inset',
                        isDragging && 'ring-2 ring-brand',
                        isDisabled && 'cursor-not-allowed bg-disabled_subtle ring-disabled_subtle'
                    )}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary bg-primary shadow-xs">
                        <UploadCloud className="h-5 w-5 text-tertiary" />
                    </div>

                    <div className="flex flex-col gap-1 text-center">
                        <div className="flex justify-center gap-1 text-center">
                            <input
                                ref={inputRef}
                                id={id}
                                type="file"
                                className="peer sr-only"
                                disabled={isDisabled}
                                accept={ALLOWED_EXTENSIONS.join(',')}
                                multiple
                                onChange={handleInputChange}
                            />
                            <label htmlFor={id} className="flex cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    disabled={isDisabled}
                                    className={cx(
                                        'text-sm font-semibold text-brand-secondary hover:text-brand-secondary_alt',
                                        isDisabled && 'cursor-not-allowed opacity-50'
                                    )}
                                >
                                    Click to upload
                                </button>
                            </label>
                            <span className="text-sm max-md:hidden">or drag and drop</span>
                        </div>
                        <p className="text-xs text-tertiary">
                            SVG, PNG, JPG or GIF (max. 800x400px)
                        </p>
                    </div>
                </div>
            )}

            {/* Uploading files */}
            <AnimatePresence>
                {Array.from(uploadingFiles.entries()).map(([fileId, state]) => (
                    <motion.div
                        key={fileId}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 rounded-lg border border-secondary bg-primary p-3"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            {isImageFile(state.file.name) ? (
                                <ImageIcon className="h-5 w-5 text-tertiary" />
                            ) : (
                                <FileText className="h-5 w-5 text-tertiary" />
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="truncate text-sm font-medium text-secondary">{state.file.name}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-tertiary">{formatFileSize(state.file.size)}</span>
                                {state.uploading && !state.error && (
                                    <>
                                        <span className="text-xs text-tertiary">•</span>
                                        <span className="text-xs text-brand-secondary">{state.progress}%</span>
                                    </>
                                )}
                                {state.error && (
                                    <>
                                        <span className="text-xs text-tertiary">•</span>
                                        <span className="text-xs text-error-primary">{state.error}</span>
                                    </>
                                )}
                            </div>
                            {state.uploading && !state.error && (
                                <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-brand-solid transition-all duration-300"
                                        style={{ width: `${state.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {state.error && (
                            <button
                                type="button"
                                onClick={() => handleRemoveUploading(fileId)}
                                className="p-1 text-tertiary hover:text-primary"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Uploaded files */}
            <AnimatePresence>
                {files.map((file) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-3 rounded-lg border border-secondary bg-primary p-3"
                    >
                        <div className="flex items-start gap-3">
                            {/* Thumbnail or icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                                {isImageFile(file.filename) ? (
                                    <img
                                        src={file.url}
                                        alt={file.filename}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FileText className="h-5 w-5 text-tertiary" />
                                )}
                            </div>

                            {/* File info */}
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <p className="truncate text-sm font-medium text-secondary">{file.filename}</p>
                                <span className="text-xs text-tertiary">{formatFileSize(file.size)}</span>
                            </div>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                disabled={isDisabled}
                                className="p-1 text-tertiary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Description input */}
                        <input
                            type="text"
                            value={fileDescriptions[file.id] || ''}
                            onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                            disabled={isDisabled}
                            placeholder="Add a description for this file..."
                            className={cx(
                                'w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary placeholder:text-quaternary',
                                'focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20',
                                'disabled:cursor-not-allowed disabled:bg-disabled_subtle'
                            )}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Hint text */}
            <p className="text-xs text-tertiary">
                Upload reference images, mood boards, brand guidelines, or any files that help communicate your vision.
            </p>
        </div>
    );
}
