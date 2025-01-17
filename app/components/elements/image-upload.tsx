'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button, Input } from '@nextui-org/react';

type UploadedFile = {
    name: string;
    url: string;
};

export default function FileManager({
    imageUrls,
    setFormData,
}: {
    imageUrls: string[];
    setFormData: Function
}) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]); // Uploaded file objects
    const fileInputRef = useRef<HTMLInputElement>(null); // Reference to file input

    useEffect(() => {
        const persistedUrls = imageUrls.map((url: string) => ({
            name: url.substring(url.lastIndexOf('/') + 1).replace(/\.(?=[^.]+$)/, ' (') + ')',
            url: url
        }))
        setUploadedFiles((prevData) => (persistedUrls));
    }, [imageUrls]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
        }
    };

    // Remove a file from the selected files list
    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload files to the server
    const uploadFiles = async () => {
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach((file) => formData.append('file', file));

        try {
            const response = await fetch('/api/file-management', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.files) {
                setFiles([]); // Clear local files after upload
                console.log('Files uploaded successfully:', data.files);
                // Clear the file input value
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                const uniqueFileUrls = Array.from(new Set([...uploadedFiles, ...data.files].map((file) => file.url)));
                setFormData((prevData: any) => ({
                    ...prevData,
                    "images": uniqueFileUrls,
                }));
                setUploadedFiles((prevFiles) => [...prevFiles, ...data.files]);
            } else {
                console.error('Error uploading files:', data.error);
            }
        } catch (error) {
            console.error('Unexpected error while uploading files:', error);
        }
    };

    // Delete a file from the server
    const deleteFile = async (fileName: string) => {
        try {
            const response = await fetch('/api/file-management', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName }),
            });

            const data = await response.json();

            if (data.success) {
                setUploadedFiles((prevFiles) =>
                    prevFiles.filter((file) => file.name !== fileName)
                );
                console.log('File deleted successfully:', data.message);
            } else {
                console.error('Error deleting file:', data.error);
            }
        } catch (error) {
            console.error('Unexpected error while deleting file:', error);
        }
    };

    return (
        <div className="space-y-4">
            <h3>Product Images</h3>

            {/* File input */}
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full"
            />

            {/* Selected files to upload */}
            {files.length > 0 && (
                <div>
                    <h4 className="mb-2">Files to Upload:</h4>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} className="flex justify-between items-center mb-2">
                                <span className="truncate ml-4">{file.name}</span>
                                <Button
                                    color="danger"
                                    onClick={() => removeFile(index)}
                                    size="sm"
                                    className="ml-2"
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={uploadFiles} className="mt-2 w-full" color="primary">
                        Upload Files
                    </Button>
                </div>
            )}

            {/* Uploaded files */}
            {uploadedFiles.length > 0 && (
                <div>
                    <h4 className="mb-2">Uploaded Files:</h4>
                    <ul>
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="flex justify-between items-center mb-2">
                                <a href={file.url} className="ml-4" target="_blank" rel="noopener noreferrer">
                                    <img src={file.url} alt={file.name} className="w-20" />
                                </a>
                                <Button
                                    color="danger"
                                    onClick={() => deleteFile(file.name)}
                                    size="sm"
                                    className="ml-2"
                                >
                                    Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
