import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/images/products");

export const POST = async (req: NextRequest) => {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const formData = await req.formData();
        const fileEntries = Array.from(formData.entries()).filter(([key, value]) => value instanceof File);

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const uploadedFiles = [];

        for (const [_, file] of fileEntries) {
            const buffer = Buffer.from(await (file as File).arrayBuffer());
            const filePath = path.resolve(UPLOAD_DIR, (file as File).name);
            fs.writeFileSync(filePath, buffer);
            uploadedFiles.push({ 
                name: (file as File).name, 
                url: `/images/products/${(file as File).name}`
            });
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Error uploading files:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to upload files.",
        });
    }
};

export const DELETE = async (req: NextRequest) => {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { fileName } = await req.json();

        if (!fileName) {
            return NextResponse.json({ success: false, error: "File name is required." });
        }

        const extensionMatch = fileName.match(/\((.*?)\)/);
        const imageExtension = extensionMatch ? extensionMatch[1] : '';
        const sanitizedFileName = fileName ?
            fileName
                .replace(/\s/g, '')
                .replace(/\((.*?)\)/g, '')
            + '.' + imageExtension
            : fileName;

        // Decode the file name from URL encoding
        const decodedFileName = decodeURIComponent(sanitizedFileName);
        const filePath = path.resolve(UPLOAD_DIR, decodedFileName);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: "File not found." });
        }

        fs.unlinkSync(filePath); // Delete the file

        return NextResponse.json({ success: true, message: "File deleted successfully." });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ success: false, error: "Failed to delete file." });
    }
};