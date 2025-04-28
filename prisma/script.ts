// prisma/seed.ts

import { Prisma } from '@/lib/generated/prisma';  // your prisma output path
import bcrypt from 'bcryptjs'; // because passwords should be hashed!
import { prisma } from "@/lib/prisma"


async function main() {
  // First, hash the password
  const hashedPassword = await bcrypt.hash('devminpassword', 10); // replace with a strong password

  // Create the devmin user
  const devmin = await prisma.user.create({
    data: {
      username: 'devmin',
      firstName: 'Dev',
      lastName: 'Min',
      email: 'devmin@example.com',
      cnic: '12345-6789012-3',
      password: hashedPassword,
      salary: 100000,
      address: 'Devmin Address',
      department: 'IT',
      position: 'Super Admin',
      joinDate: new Date(),
      phone: '0312-3456789',
      role: 'ADMIN',
    },
  });

  console.log('Devmin user created:', devmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
