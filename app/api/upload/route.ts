import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueId = uuidv4();
    const extension = file.name.split(".").pop();
    const filename = `${uniqueId}.${extension}`;

    // Ensure the uploads directory exists
    const publicDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }
    
    // Save file to public directory
    const filepath = join(publicDir, filename);
    
    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      console.error("Error writing file:", error);
      return NextResponse.json(
        { message: "Error saving file to disk" },
        { status: 500 }
      );
    }

    // Return the URL
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error uploading file" },
      { status: 500 }
    );
  }
} 