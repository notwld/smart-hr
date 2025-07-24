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

    // Helper function to check if a value is empty or undefined
    const isEmpty = (value: any) => {
      return value === undefined || 
             value === null || 
             value === '' || 
             value === 'undefined' || 
             value === 'null' ||
             (typeof value === 'string' && value.trim() === '');
    };

    // Safety check: Limit number of sheets to prevent excessive processing
    if (workbook.SheetNames.length > 100) {
      return NextResponse.json(
        { message: `Too many sheets in workbook (${workbook.SheetNames.length}). Maximum allowed is 100 sheets.` },
        { status: 400 }
      );
    }

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      try {
        console.log(`Processing sheet: ${sheetName}`);
        results.sheets.push(sheetName);
        const worksheet = workbook.Sheets[sheetName];
        
        // First, try to read the sheet as raw data to understand its structure
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        console.log(`Sheet ${sheetName} raw structure:`, rawData.slice(0, 5));
        
        // Try different parsing approaches
        let data: ExcelAttendanceRow[] = [];
        let headerRowIndex = -1;
        
        // Look for a row that contains date-like headers or time-like headers
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i] as any[];
          const rowText = row.join(' ').toLowerCase();
          
          if (rowText.includes('date') || rowText.includes('time') || 
              rowText.includes('first') || rowText.includes('last') ||
              rowText.includes('check') || rowText.includes('in') || 
              rowText.includes('out') || rowText.includes('person')) {
            headerRowIndex = i;
            console.log(`Found potential header at row ${i}:`, row);
            break;
          }
        }
        
        if (headerRowIndex >= 0) {
          // Use the found header row
          data = XLSX.utils.sheet_to_json(worksheet, { 
            header: headerRowIndex,
            defval: "",
            raw: false 
          });
        } else {
          // Fallback: Try to parse without headers and map columns by position
          const allData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: "",
            raw: false 
          });
          
          // Skip empty rows and convert to objects with position-based mapping
          data = allData.slice(1).filter((row: any) => {
            return row && row.length > 0 && row.some((cell: any) => cell && cell.toString().trim() !== '');
          }).map((row: any) => {
            const obj: any = {};
            
            // Map columns by position - adjust these based on your Excel structure
            if (row[0]) obj['Person ID'] = row[0];
            if (row[1]) obj['Name'] = row[1];
            if (row[2]) obj['Date'] = row[2];
            if (row[3]) obj['First-In'] = row[3];
            if (row[4]) obj['Last-Out'] = row[4];
            
            // Try to find date and time columns by scanning the row
            for (let i = 0; i < row.length; i++) {
              const cellValue = row[i];
              if (cellValue && typeof cellValue === 'string') {
                // Check if it looks like a date
                if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(cellValue) || 
                    /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(cellValue)) {
                  obj['Date'] = cellValue;
                }
                // Check if it looks like a time
                else if (/\d{1,2}:\d{2}/.test(cellValue) || /\d{1,4}\s*(am|pm)/i.test(cellValue)) {
                  if (!obj['First-In']) {
                    obj['First-In'] = cellValue;
                  } else if (!obj['Last-Out']) {
                    obj['Last-Out'] = cellValue;
                  }
                }
              }
            }
            
            return obj;
          });
        }
        
        console.log(`Sheet ${sheetName} parsed data sample:`, data.slice(0, 3));

        if (data.length === 0) {
          results.errors.push(`Sheet "${sheetName}" is empty`);
          continue;
        }

        // Safety check: Limit the number of rows to prevent infinite processing
        if (data.length > 10000) {
          results.errors.push(`Sheet "${sheetName}" has too many rows (${data.length}). Maximum allowed is 10,000 rows.`);
          continue;
        }

        // Log sample data and columns for debugging
        if (results.sampleData.length === 0 && data.length > 0) {
          results.sampleData = data.slice(0, 3); // First 3 rows
          results.foundColumns = Object.keys(data[0] || {});
          console.log('Found columns:', results.foundColumns);
          console.log('Sample data:', data[0]);
          
          // Log first few valid (non-empty) rows for better debugging
          const validRows = data.filter((row, index) => {
            return !isEmpty(row.Date) || !isEmpty(row.Name) || !isEmpty(row['Person ID']);
          }).slice(0, 2);
          
          console.log('Valid sample rows:', validRows);
          
          // Also log the raw sheet structure for debugging
          console.log('Raw sheet range:', worksheet['!ref']);
          
          // Re-read raw data for debugging if not available
          const debugRawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          console.log('Sheet structure sample:', debugRawData.slice(0, 5));
        }

        // Process each row in the sheet
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
          try {
            results.totalProcessed++;

            // Safety check: Prevent infinite processing
            if (results.totalProcessed > 50000) {
              results.errors.push(`Processing stopped: Maximum limit of 50,000 rows reached across all sheets.`);
              return NextResponse.json({
                message: "Import stopped due to size limits",
                results,
              }, { status: 200 });
            }



            // Get the check-in time from various possible column names (more flexible)
            const checkInTime = row['First-In'] || row['First In'] || row['Check In'] || row['Time In'] ||
                               row['CheckIn'] || row['Check-In'] || row['IN'] || row['In'] ||
                               row['START'] || row['Start'] || row['Entry'] || row['ENTRY'];
                               
            const checkOutTime = row['Last-Out'] || row['Last Out'] || row['Check Out'] || row['Time Out'] ||
                                row['CheckOut'] || row['Check-Out'] || row['OUT'] || row['Out'] ||
                                row['END'] || row['End'] || row['Exit'] || row['EXIT'];
                                
            // Also try to get from __EMPTY columns if named columns don't work
            if (!checkInTime && !checkOutTime) {
              const rowValues = Object.values(row);
              const timeValues = rowValues.filter(val => 
                val && typeof val === 'string' && 
                (/\d{1,2}:\d{2}/.test(val) || /\d{1,4}\s*(am|pm)/i.test(val))
              );
              
              if (timeValues.length >= 2) {
                Object.assign(row, {
                  'First-In': timeValues[0],
                  'Last-Out': timeValues[1]
                });
              } else if (timeValues.length === 1) {
                Object.assign(row, {
                  'First-In': timeValues[0]
                });
              }
            }

            // Skip completely empty rows
            if (isEmpty(row.Date) && isEmpty(checkInTime) && isEmpty(row.Name) && isEmpty(row['Person ID'])) {
              results.totalSkipped++;
              continue; // Skip silently for completely empty rows
            }

            // Validate required fields
            if (isEmpty(row.Date) || isEmpty(checkInTime)) {
              results.totalSkipped++;
              const dateValue = isEmpty(row.Date) ? '[empty]' : row.Date;
              const checkInValue = isEmpty(checkInTime) ? '[empty]' : checkInTime;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Missing required Date or Check-in time. Date: "${dateValue}", CheckIn: "${checkInValue}"`);
              continue;
            }

            // Find user by name or Person ID with more flexible matching
            let user = null;
            
            // First try Person ID / CNIC from various possible fields
            const possibleIds = [
              row['Person ID'], row['PersonID'], row['ID'], row['person_id'],
              row['Employee ID'], row['EmployeeID'], row['Emp ID'], row['EmpID']
            ].filter(id => !isEmpty(id));
            
            for (const personId of possibleIds) {
              if (personId) {
                const idStr = personId.toString().trim();
                user = allUsers.find(u => 
                  u.id === idStr || 
                  u.cnic === idStr ||
                  u.username === idStr
                );
                if (user) break;
              }
            }
            
            // Try to find by sheet name if no user found yet
            if (!user) {
              const cleanSheetName = sheetName.trim().toLowerCase();
              user = allUsers.find(u => {
                const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                return fullName === cleanSheetName || 
                       u.username.toLowerCase() === cleanSheetName ||
                       u.firstName.toLowerCase() === cleanSheetName ||
                       u.lastName.toLowerCase() === cleanSheetName;
              });
              
              if (user) {
                console.log(`Found user by sheet name: ${sheetName} -> ${user.firstName} ${user.lastName}`);
                // If we found user by sheet name, we can process all rows in this sheet for this user
                row.Name = `${user.firstName} ${user.lastName}`;
              }
            }

            // If not found by ID, try to find by name with flexible matching
            if (!user && !isEmpty(row.Name)) {
              const searchName = row.Name.toString().trim().toLowerCase();
              
              // Skip if name is too short
              if (searchName.length < 2) {
                results.totalSkipped++;
                results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Name "${row.Name}" is too short for matching.`);
                continue;
              }
              
              // Try exact full name match
              user = allUsers.find(u => 
                `${u.firstName} ${u.lastName}`.toLowerCase() === searchName
              );

              // Try partial name matching
              if (!user) {
                const nameParts = searchName.split(/\s+/).filter(part => part.length > 0);
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
              const identifier = !isEmpty(row.Name) ? row.Name : (!isEmpty(row['Person ID']) ? row['Person ID'] : '[no name/ID]');
              const availableUsers = allUsers.slice(0, 5).map(u => `${u.firstName} ${u.lastName}`).join(', ');
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": User "${identifier}" not found. Available users: ${availableUsers}...`);
              continue;
            }

            // Parse date with more flexible date handling
            let attendanceDate: Date;
            let dateValue = row.Date || row.date || row.DATE;
            
            // Try to find date in any column if not found in expected places
            if (isEmpty(dateValue)) {
              const rowValues = Object.values(row);
              for (const val of rowValues) {
                if (val && typeof val === 'string') {
                  if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(val) || 
                      /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(val)) {
                    dateValue = val;
                    break;
                  }
                }
              }
            }
            
            try {
              if (typeof dateValue === 'number') {
                // Excel date number
                attendanceDate = new Date((dateValue - 25569) * 86400 * 1000);
              } else if (dateValue) {
                // String date - try multiple formats
                const dateStr = dateValue.toString().trim();
                
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
                    
                    // If still invalid, try YYYY/MM/DD
                    if (isNaN(attendanceDate.getTime())) {
                      attendanceDate = new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
                    }
                  }
                }
              } else {
                throw new Error('No date found');
              }
              
              if (isNaN(attendanceDate.getTime())) {
                throw new Error('Invalid date');
              }
              
              attendanceDate.setHours(0, 0, 0, 0);
            } catch (error) {
              results.totalSkipped++;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Invalid date format "${dateValue}". Expected formats: DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD`);
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
              if (!isEmpty(checkInTime)) {
                checkInDateTime = parseTime(checkInTime.toString(), attendanceDate);
              }

              if (!isEmpty(checkOutTime)) {
                checkOutDateTime = parseTime(checkOutTime.toString(), attendanceDate);
              }

              if (checkInDateTime && checkOutDateTime) {
                totalHours = (checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);
                
                // Validate that check-out is after check-in
                if (totalHours < 0) {
                  results.totalSkipped++;
                  results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Check-out time is before check-in time. CheckIn: "${checkInTime}", CheckOut: "${checkOutTime}"`);
                  continue;
                }
              }
            } catch (error) {
              results.totalSkipped++;
              const checkInValue = isEmpty(checkInTime) ? '[empty]' : checkInTime;
              const checkOutValue = isEmpty(checkOutTime) ? '[empty]' : checkOutTime;
              results.errors.push(`Row ${rowIndex + 1} in sheet "${sheetName}": Invalid time format. CheckIn: "${checkInValue}", CheckOut: "${checkOutValue}" - ${error.message}`);
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
  if (!timeStr || timeStr.trim() === '' || timeStr === 'undefined' || timeStr === 'null') {
    throw new Error('Empty or invalid time string');
  }

  const date = new Date(baseDate);
  
  // Handle different time formats
  timeStr = timeStr.toString().trim();
  
  // Check for obviously invalid values
  if (timeStr.toLowerCase().includes('undefined') || timeStr.toLowerCase().includes('null')) {
    throw new Error('Invalid time value');
  }
  
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