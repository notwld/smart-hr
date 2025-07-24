import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Fetch attendance records for the employee within the date range
    const attendance = await prisma.attendance.findMany({
      where: {
        userId: params.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        id: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        totalHours: true,
        status: true
      }
    });

    // Format the response
    const formattedAttendance = attendance.map(record => ({
      id: record.id,
      date: record.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      checkInTime: record.checkInTime?.toISOString() || null,
      checkOutTime: record.checkOutTime?.toISOString() || null,
      totalHours: record.totalHours,
      status: record.status
    }));

    return NextResponse.json({
      attendance: formattedAttendance,
      employee: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 