# Break Tracking System - Multiple Breaks Per Day

## Overview
The system now supports tracking **multiple breaks per day** for each employee. The CEO can query breaks by date, employee, and see detailed break information.

## Schema Changes

### New Model: `Break`
- `id`: Unique identifier
- `attendanceId`: Links to Attendance record
- `startTime`: When the break started
- `endTime`: When the break ended (null if still active)
- `duration`: Duration in minutes (calculated when break ends)
- Indexed on `attendanceId` and `startTime` for fast queries

### Attendance Model
- Added `breaks` relationship (one-to-many)
- Existing `breakStartTime` and `breakEndTime` fields kept for backward compatibility
- `totalBreakTime` now calculated from all Break records

## API Endpoints

### 1. Start Break
**POST** `/api/attendance/break-start`
- Creates a new Break record
- Updates old `breakStartTime` field for backward compatibility
- Prevents starting a new break if one is already active

### 2. End Break
**POST** `/api/attendance/break-end`
- Updates the active Break record with `endTime` and `duration`
- Recalculates `totalBreakTime` from all completed breaks
- Updates old `breakEndTime` field for backward compatibility

### 3. CEO Query - View All Breaks
**GET** `/api/attendance/breaks`

#### Query Parameters:
- `date`: Specific date (YYYY-MM-DD) - optional
- `dateFrom`: Start date (YYYY-MM-DD) - optional
- `dateTo`: End date (YYYY-MM-DD) - optional
- `userId`: Specific employee ID - optional
- `employeeName`: Search by employee name - optional
- `department`: Filter by department - optional

#### Example Requests:

```bash
# Get all breaks on a specific date
GET /api/attendance/breaks?date=2024-11-12

# Get all breaks in a date range
GET /api/attendance/breaks?dateFrom=2024-11-01&dateTo=2024-11-30

# Get breaks for a specific employee
GET /api/attendance/breaks?userId=clx123456

# Get breaks by employee name
GET /api/attendance/breaks?employeeName=John

# Get breaks by department
GET /api/attendance/breaks?department=Engineering

# Combined filters
GET /api/attendance/breaks?dateFrom=2024-11-01&dateTo=2024-11-30&department=Engineering
```

#### Response Format:
```json
{
  "breaks": [
    {
      "id": "break_id",
      "date": "2024-11-12",
      "employeeId": "user_id",
      "employeeName": "John Doe",
      "employeeEmail": "john@example.com",
      "department": "Engineering",
      "position": "Developer",
      "breakStartTime": "2024-11-12T10:30:00.000Z",
      "breakEndTime": "2024-11-12T11:00:00.000Z",
      "duration": 30,
      "formattedDuration": "0h 30m",
      "attendanceId": "attendance_id",
      "checkInTime": "2024-11-12T09:00:00.000Z",
      "checkOutTime": "2024-11-12T17:00:00.000Z"
    }
  ],
  "summary": {
    "totalBreaks": 150,
    "totalBreakTime": 4500,
    "uniqueEmployees": 25,
    "dateRange": {
      "from": "2024-11-01",
      "to": "2024-11-30"
    }
  },
  "filters": {
    "dateFrom": "2024-11-01",
    "dateTo": "2024-11-30",
    "department": "Engineering"
  }
}
```

### 4. Admin Attendance API (Updated)
**GET** `/api/attendance/admin`
- Now includes `breaks` array in each attendance record
- Breaks are ordered by `startTime` ascending

## Data Safety

✅ **No data loss**: 
- Only adds a new `Break` table
- Existing `Attendance` table unchanged
- Old `breakStartTime`/`breakEndTime` fields preserved for backward compatibility

✅ **Backward compatible**:
- Old break fields still work
- New breaks automatically create Break records
- Old breaks can be migrated if needed

## Usage Examples

### For CEO/Admin Dashboard:
```typescript
// Fetch all breaks for November 2024
const response = await fetch('/api/attendance/breaks?dateFrom=2024-11-01&dateTo=2024-11-30');
const data = await response.json();

// Display breaks in a table
data.breaks.forEach(breakRecord => {
  console.log(`${breakRecord.employeeName} took a break from ${breakRecord.breakStartTime} to ${breakRecord.breakEndTime}`);
});
```

### For Employee View:
- Employees can take multiple breaks per day
- Each break is tracked separately
- Total break time is calculated from all breaks

## Migration Applied

The migration has been applied using `prisma db push`. The `Break` table is now available in the database.

## Next Steps (Optional UI Enhancements)

1. Update `AttendanceTab.tsx` to display multiple breaks per day
2. Add a "View Breaks" button that shows all breaks for a selected date/employee
3. Create a CEO dashboard component that uses `/api/attendance/breaks`
4. Add break visualization (timeline, charts, etc.)

