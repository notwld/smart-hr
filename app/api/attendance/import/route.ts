import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";
import * as XLSX from 'xlsx';

interface ExcelAttendanceRow {
  Index?: number;
  'Person ID'?: string;
  Name?: string;
  Department?: string;
  Position?: string;
  Gender?: string;
  Date?: string;
  'Day Of Week'?: string;
  Timetable?: string;
  'First-In'?: string;
  'Last-Out'?: string;
  // Alternative column names to handle different formats
  'First In'?: string;
  'Last Out'?: string;
  'Check In'?: string;
  'Check Out'?: string;
  'Time In'?: string;
  'Time Out'?: string;
}

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

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const results = {
      totalProcessed: 0,
      totalCreated: 0,
      totalSkipped: 0,
      errors: [] as string[],
      sheets: [] as string[],
      sampleData: [] as any[], // For debugging
      foundColumns: [] as string[], // For debugging
    };

    console.log('Available sheets:', workbook.SheetNames);
    results.sheets = workbook.SheetNames;

    // Get all existing users for name matching
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        cnic: true,
      }
    });

    console.log(`Found ${allUsers.length} users in database`);

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      try {
        console.log(`Processing sheet: ${sheetName}`);
        results.sheets.push(sheetName);
        const worksheet = workbook.Sheets[sheetName];
        const data: ExcelAttendanceRow[] = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          results.errors.push(`Sheet "${sheetName}" is empty`);
          continue;
        }

        // Log sample data and columns for debugging
        if (results.sampleData.length === 0 && data.length > 0) {
          results.sampleData = data.slice(0, 3); // First 3 rows
          results.foundColumns = Object.keys(data[0] || {});
          console.log('Found columns:', results.foundColumns);
          console.log('Sample data:', data[0]);
        }

        // Process each row in the sheet
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
          try {
            results.totalProcessed++;

            // Get the check-in time from various possible column names
            const checkInTime = row['First-In'] || row['First In'] || row['Check In'] || row['Time In'];
            const checkOutTime = row['Last-Out'] || row['Last Out'] || row['Check Out'] || row['Time Out'];

            // Validate required fields
            if (!row.Date || !checkInTime) {
              results.totalSkipped++;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Missing required Date or Check-in time. Date: "${row.Date}", CheckIn: "${checkInTime}"`);
              continue;
            }

            // Find user by name or Person ID with more flexible matching
            let user = null;
            
            // First try Person ID / CNIC
            if (row['Person ID']) {
              user = allUsers.find(u => 
                u.id === row['Person ID'] || 
                u.cnic === row['Person ID'] ||
                u.username === row['Person ID']
              );
            }

            // If not found by ID, try to find by name with flexible matching
            if (!user && row.Name) {
              const searchName = row.Name.toString().trim().toLowerCase();
              
              // Try exact full name match
              user = allUsers.find(u => 
                `${u.firstName} ${u.lastName}`.toLowerCase() === searchName
              );

              // Try partial name matching
              if (!user) {
                const nameParts = searchName.split(/\s+/);
                if (nameParts.length >= 2) {
                  const firstName = nameParts[0];
                  const lastName = nameParts[nameParts.length - 1];
                  
                  user = allUsers.find(u => 
                    u.firstName.toLowerCase().includes(firstName) && 
                    u.lastName.toLowerCase().includes(lastName)
                  );
                }
              }

              // Try username match
              if (!user) {
                user = allUsers.find(u => 
                  u.username.toLowerCase().includes(searchName.replace(/\s+/g, '.'))
                );
              }
            }

            if (!user) {
              results.totalSkipped++;
              const availableUsers = allUsers.slice(0, 5).map(u => `${u.firstName} ${u.lastName}`).join(', ');
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": User "${row.Name || row['Person ID']}" not found. Available users: ${availableUsers}...`);
              continue;
            }

            // Parse date with more flexible date handling
            let attendanceDate: Date;
            try {
              if (typeof row.Date === 'number') {
                // Excel date number
                attendanceDate = new Date((row.Date - 25569) * 86400 * 1000);
              } else {
                // String date - try multiple formats
                const dateStr = row.Date.toString();
                
                // Try parsing as-is
                attendanceDate = new Date(dateStr);
                
                // If invalid, try different formats
                if (isNaN(attendanceDate.getTime())) {
                  // Try DD/MM/YYYY or MM/DD/YYYY format
                  const dateParts = dateStr.split(/[\/\-\.]/);
                  if (dateParts.length === 3) {
                    // Try DD/MM/YYYY first (common in many countries)
                    attendanceDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);
                    
                    // If still invalid, try MM/DD/YYYY
                    if (isNaN(attendanceDate.getTime())) {
                      attendanceDate = new Date(`${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`);
                    }
                  }
                }
              }
              
              if (isNaN(attendanceDate.getTime())) {
                throw new Error('Invalid date');
              }
              
              attendanceDate.setHours(0, 0, 0, 0);
            } catch (error) {
              results.totalSkipped++;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Invalid date format "${row.Date}". Expected formats: DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD`);
              continue;
            }

            // Check if attendance already exists
            const existingAttendance = await prisma.attendance.findFirst({
              where: {
                userId: user.id,
                date: attendanceDate,
              },
            });

            if (existingAttendance) {
              results.totalSkipped++;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Attendance already exists for ${user.firstName} ${user.lastName} on ${attendanceDate.toDateString()}`);
              continue;
            }

            // Parse times with more flexible time handling
            let checkInDateTime: Date | null = null;
            let checkOutDateTime: Date | null = null;
            let totalHours: number | null = null;

            try {
              if (checkInTime) {
                checkInDateTime = parseTime(checkInTime.toString(), attendanceDate);
              }

              if (checkOutTime) {
                checkOutDateTime = parseTime(checkOutTime.toString(), attendanceDate);
              }

              if (checkInDateTime && checkOutDateTime) {
                totalHours = (checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);
              }
            } catch (error) {
              results.totalSkipped++;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Invalid time format. CheckIn: "${checkInTime}", CheckOut: "${checkOutTime}"`);
              continue;
            }

            // Create attendance record
            await prisma.attendance.create({
              data: {
                userId: user.id,
                date: attendanceDate,
                checkInTime: checkInDateTime,
                checkOutTime: checkOutDateTime,
                totalHours,
                status: "PRESENT",
              },
            });

            results.totalCreated++;
            console.log(`Created attendance for ${user.firstName} ${user.lastName} on ${attendanceDate.toDateString()}`);
          } catch (error) {
            results.totalSkipped++;
            results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error processing sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: "Import completed",
      results,
    }, { status: 200 });

  } catch (error) {
    console.error("Error importing attendance:", error);
    return NextResponse.json(
      { message: "Error importing attendance data" },
      { status: 500 }
    );
  }
}

// Helper function to parse time strings
function parseTime(timeStr: string, baseDate: Date): Date {
  if (!timeStr || timeStr.trim() === '') {
    throw new Error('Empty time string');
  }

  const date = new Date(baseDate);
  
  // Handle different time formats
  timeStr = timeStr.toString().trim();
  
  // Remove any extra spaces
  timeStr = timeStr.replace(/\s+/g, ' ');
  
  // Handle formats like "9:30 AM", "09:30", "9:30", "930", etc.
  let hours = 0;
  let minutes = 0;
  
  // Check for AM/PM
  const isAM = /am/i.test(timeStr);
  const isPM = /pm/i.test(timeStr);
  
  // Remove AM/PM from string
  timeStr = timeStr.replace(/\s*(am|pm)/i, '');
  
  // Handle colon format (9:30, 09:30)
  if (timeStr.includes(':')) {
    const [hourStr, minuteStr] = timeStr.split(':');
    hours = parseInt(hourStr);
    minutes = parseInt(minuteStr);
  } 
  // Handle decimal format (9.5 = 9:30)
  else if (timeStr.includes('.')) {
    const decimal = parseFloat(timeStr);
    hours = Math.floor(decimal);
    minutes = Math.round((decimal - hours) * 60);
  }
  // Handle HHMM format (0930, 930)
  else {
    const num = parseInt(timeStr);
    if (num >= 100) {
      hours = Math.floor(num / 100);
      minutes = num % 100;
    } else {
      hours = num;
      minutes = 0;
    }
  }
  
  // Handle AM/PM
  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  // Validate hours and minutes
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time: ${hours}:${minutes}`);
  }
  
  date.setHours(hours, minutes, 0, 0);
  return date;
} 