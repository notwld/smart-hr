import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hosting = await prisma.hosting.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
          }
        }
      }
    });

    if (!hosting) {
      return NextResponse.json(
        { error: 'Hosting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ hosting });
  } catch (error) {
    console.error("Error fetching hosting:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const data = await req.json();
    const {
      clientId,
      domain,
      cost,
      startDate,
      expiryDate,
      durationType,
      notes,
    } = data;

    // Validate required fields
    if (!clientId || !domain || !cost || !startDate || !expiryDate || !durationType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate cost is a number
    if (typeof cost !== 'number' || cost < 0) {
      return NextResponse.json(
        { message: "Invalid cost value" },
        { status: 400 }
      );
    }

    // Check if hosting exists
    const existingHosting = await prisma.hosting.findUnique({
      where: { id: params.id }
    });

    if (!existingHosting) {
      return NextResponse.json(
        { message: "Hosting not found" },
        { status: 404 }
      );
    }

    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if domain already exists (excluding current hosting)
    const domainConflict = await prisma.hosting.findFirst({
      where: { 
        domain,
        NOT: { id: params.id }
      }
    });

    if (domainConflict) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 400 }
      );
    }

    // Update hosting
    const hosting = await prisma.hosting.update({
      where: { id: params.id },
      data: {
        clientId,
        domain,
        cost: Number(cost),
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        durationType,
        notes,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: "Hosting updated successfully",
      hosting,
    });
  } catch (error) {
    console.error("Error updating hosting:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    // Check if hosting exists
    const existingHosting = await prisma.hosting.findUnique({
      where: { id: params.id }
    });

    if (!existingHosting) {
      return NextResponse.json(
        { message: "Hosting not found" },
        { status: 404 }
      );
    }

    // Delete hosting
    await prisma.hosting.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: "Hosting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hosting:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 