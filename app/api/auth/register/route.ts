import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      cnic,
      pfp,
      password,
      salary,
      address,
      department,
      position,
      phone,
    } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { cnic },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email, username, or CNIC already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        cnic,
        pfp,
        password: hashedPassword,
        salary,
        address,
        department,
        position,
        phone,
        joinDate: new Date(),
      },
    })

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 