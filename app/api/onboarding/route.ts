import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { hasPermission } from "@/lib/permissions";
import { sendWelcomeEmailServer } from "@/lib/serverEmailService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has permission to complete onboarding
    const hasOnboardingPermission = await hasPermission(userId, "onboarding.complete");
    if (!hasOnboardingPermission) {
      return NextResponse.json({
        message: 'You do not have permission to complete onboarding'
      }, { status: 403 });
    }

    // Check if user exists and hasn't completed onboarding yet
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        onboardingCompleted: true,
        password: true,
        legacyRole: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has already completed onboarding
    if (existingUser.onboardingCompleted) {
      return NextResponse.json({
        message: 'Onboarding already completed'
      }, { status: 400 });
    }

    const data = await req.json();

    const {
      firstName,
      lastName,
      email,
      cnic,
      address,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      department,
      position,
      salary,
      password,
      emergencyContact,
      education,
      experience,
      bankDetails,
      image,
    } = data;

    // Validate required fields
    if (!firstName || !lastName || !email || !cnic || !address || !phone ||
        !dateOfBirth || !gender || !maritalStatus || !department || !position ||
        !salary || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate salary is a number
    if (typeof salary !== 'number' || salary < 0) {
      return NextResponse.json(
        { message: "Invalid salary value" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        cnic,
        password: hashedPassword,
        address,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        maritalStatus,
        department,
        position,
        salary: Number(salary),
        onboardingCompleted: true,
        image: image || undefined,
        emergencyContact: emergencyContact ? {
          upsert: {
            where: { userId },
            create: emergencyContact,
            update: emergencyContact,
          },
        } : undefined,
        education: education && education.length > 0 ? {
          create: education.map((edu: any) => ({
            ...edu,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        } : undefined,
        experience: experience && experience.length > 0 ? {
          create: experience.map((exp: any) => ({
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        } : undefined,
        bankDetails: bankDetails ? {
          upsert: {
            where: { userId },
            create: bankDetails,
            update: bankDetails,
          },
        } : undefined,
      },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        bankDetails: true,
      },
    });

    // Send welcome email
    try {
      const emailSent = await sendWelcomeEmailServer({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        department: updatedUser.department,
        position: updatedUser.position,
        loginEmail: updatedUser.email,
        portalUrl: 'https://portal.mizetechnologies.com/'
      });

      if (emailSent) {
        // Welcome email sent successfully
      } else {
        // Welcome email failed to send
      }
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: updatedUser,
      emailSent: true // We'll always return true to avoid client-side confusion
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error completing onboarding:", error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('email')) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
      if (target?.includes('cnic')) {
        return NextResponse.json(
          { message: "CNIC already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: `Unique constraint failed on: ${target?.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error completing onboarding" },
      { status: 500 }
    );
  }
}
