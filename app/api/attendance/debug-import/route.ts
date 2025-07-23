import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const debugInfo = {
      fileName: file.name,
      fileSize: file.size,
      sheetNames: workbook.SheetNames,
      sheetsInfo: [] as any[],
      databaseUsers: [] as any[],
    };

    // Get database users for comparison
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        cnic: true,
      }
    });

    debugInfo.databaseUsers = allUsers.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      username: u.username,
      cnic: u.cnic,
    }));

    // Analyze each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length > 0) {
        const firstRow = data[0] as any;
        const columns = Object.keys(firstRow);
        
        debugInfo.sheetsInfo.push({
          sheetName,
          totalRows: data.length,
          columns,
          sampleData: data.slice(0, 5), // First 5 rows
          uniqueNames: [...new Set(data.map((row: any) => row.Name).filter(Boolean))].slice(0, 10),
          dateFormats: [...new Set(data.map((row: any) => row.Date).filter(Boolean))].slice(0, 5),
          timeFormats: {
            firstIn: [...new Set(data.map((row: any) => 
              row['First-In'] || row['First In'] || row['Check In'] || row['Time In']
            ).filter(Boolean))].slice(0, 5),
            lastOut: [...new Set(data.map((row: any) => 
              row['Last-Out'] || row['Last Out'] || row['Check Out'] || row['Time Out']
            ).filter(Boolean))].slice(0, 5),
          }
        });
      } else {
        debugInfo.sheetsInfo.push({
          sheetName,
          totalRows: 0,
          columns: [],
          sampleData: [],
          error: "Sheet is empty"
        });
      }
    }

    return NextResponse.json({
      message: "Debug analysis completed",
      debugInfo,
    }, { status: 200 });

  } catch (error) {
    console.error("Error analyzing file:", error);
    return NextResponse.json(
      { message: "Error analyzing file" },
      { status: 500 }
    );
  }
} 