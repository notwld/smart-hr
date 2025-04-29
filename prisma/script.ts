// prisma/seed.ts

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

async function main() {
  try {
    // First, hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        cnic: '12345-6789012-3',
        password: hashedPassword,
        salary: 100000,
        address: '123 Admin Street, City',
        department: 'Administration',
        position: 'System Administrator',
        joinDate: new Date(),
        phone: '0312-3456789',
        role: 'ADMIN',
        // Create emergency contact
        emergencyContact: {
          create: {
            name: 'Emergency Contact',
            relationship: 'Parent',
            phone: '0312-3456789',
            address: '123 Emergency Street, City',
          },
        },
        // Create education record
        education: {
          create: {
            degree: 'Master of Computer Science',
            institution: 'University of Technology',
            field: 'Computer Science',
            startDate: new Date('2010-01-01'),
            endDate: new Date('2012-12-31'),
            grade: 'A',
          },
        },
        // Create experience record
        experience: {
          create: {
            company: 'Tech Solutions Inc.',
            position: 'Senior Developer',
            startDate: new Date('2013-01-01'),
            endDate: new Date('2015-12-31'),
            description: 'Led development team and managed projects',
          },
        },
        // Create bank details
        bankDetails: {
          create: {
            bankName: 'National Bank',
            accountNumber: '1234567890',
            accountTitle: 'Admin User',
            branchCode: 'NB001',
          },
        },
      },
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
