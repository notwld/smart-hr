import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as xlsx from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Please upload an Excel file" },
        { status: 400 }
      );
    }

    // Convert file to buffer and read with xlsx
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Define field mappings (Excel column names to model fields)
    const fieldMappings = {
      'Date': 'date',
      'Time': 'time',
      'Platfrom': 'platform', // Note: handling the typo in Excel
      'Platform': 'platform', // Also handle correct spelling
      'First Call': 'firstCall',
      'Comments': 'comments',
      'Service': 'service',
      'Name': 'name',
      'Email': 'email',
      'Number': 'number',
      'Address': 'address',
      'Credits': 'credits',
      'Assigned': 'assignee'
    };

    // Helper function to convert Excel date number to ISO string
    const excelDateToISO = (excelDate: number): string => {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString();
    };

    // Helper function to convert Excel time to string
    const excelTimeToString = (excelTime: number): string => {
      const totalMinutes = Math.round(excelTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Process and insert the data
    const importedLeads = await Promise.all(data.map(async (row: any) => {
      // Find assignee by name if provided
      let assigneeId: string | null = null;
      if (row['Assigned']) {
        // Split the assigned name into first and last name
        const assignedName = String(row['Assigned']).trim();
        const [firstName, ...lastNameParts] = assignedName.split(' ');
        const lastName = lastNameParts.join(' ');
        
        const assignee = await prisma.user.findFirst({
          where: {
            AND: [
              { firstName: { contains: firstName, mode: 'insensitive' } },
              lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {}
            ]
          }
        });
        assigneeId = assignee?.id || null;
      }

      // Handle date conversion
      let processedDate: Date;
      if (typeof row['Date'] === 'number') {
        processedDate = new Date(excelDateToISO(row['Date']));
      } else if (typeof row['Date'] === 'string') {
        processedDate = new Date(row['Date']);
      } else {
        processedDate = new Date();
      }

      // Handle time conversion
      let processedTime: string;
      if (typeof row['Time'] === 'number') {
        processedTime = excelTimeToString(row['Time']);
      } else if (typeof row['Time'] === 'string') {
        processedTime = row['Time'];
      } else {
        processedTime = new Date().toTimeString().slice(0, 5);
      }

      return await prisma.lead.create({
        data: {
          date: processedDate,
          time: processedTime,
          platform: row['Platfrom'] || row['Platform'] || '',
          firstCall: String(row['First Call'] || '').toLowerCase(),
          service: row['Service'] || '',
          name: row['Name'] || '',
          email: row['Email'] || '',
          number: String(row['Number'] || ''),
          cost: parseFloat(row['Cost'] || '0') || 0,
          credits: parseInt(row['Credits'] || '0') || 0,
          comments: row['Comments'] || '',
          address: row['Address'] || '',
          status: 'new',
          assigneeId: assigneeId,
          userId: session.user.id
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    }));

    return NextResponse.json({
      message: 'Leads imported successfully',
      count: importedLeads.length,
      leads: importedLeads
    }, { status: 201 });

  } catch (error) {
    console.error('Error importing leads:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
