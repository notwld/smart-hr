import { PrismaClient } from "../lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const employees = [
  {
    username: "hamza.qureshi",
    firstName: "Hamza",
    lastName: "Qureshi",
    email: "hamza.qureshi@company.com",
    cnic: "35401-1234567-1",
    password: "employee123",
    salary: 50000,
    address: "123 Main Street, Karachi",
    department: "Development",
    position: "Software Engineer",
    joinDate: "2024-01-15",
    phone: "+92-300-1234567"
  },
  {
    username: "muhammad.sharique",
    firstName: "Muhammad",
    lastName: "Sharique",
    email: "muhammad.sharique@company.com",
    cnic: "35401-2345678-2",
    password: "employee123",
    salary: 55000,
    address: "456 Business District, Lahore",
    department: "Development",
    position: "Senior Developer",
    joinDate: "2023-11-20",
    phone: "+92-300-2345678"
  },
  {
    username: "rahat.jawaid",
    firstName: "Rahat",
    lastName: "Jawaid",
    email: "rahat.jawaid@company.com",
    cnic: "35401-3456789-3",
    password: "employee123",
    salary: 60000,
    address: "789 Tech Hub, Islamabad",
    department: "Development",
    position: "Lead Developer",
    joinDate: "2023-08-10",
    phone: "+92-300-3456789"
  },
  {
    username: "zohaib.hussain",
    firstName: "Zohaib",
    lastName: "Hussain",
    email: "zohaib.hussain@company.com",
    cnic: "35401-4567890-4",
    password: "employee123",
    salary: 48000,
    address: "321 Innovation Center, Karachi",
    department: "Development",
    position: "Frontend Developer",
    joinDate: "2024-02-01",
    phone: "+92-300-4567890"
  },
  {
    username: "kavish.asif",
    firstName: "Kavish",
    lastName: "Asif",
    email: "kavish.asif@company.com",
    cnic: "35401-5678901-5",
    password: "employee123",
    salary: 52000,
    address: "654 Software Park, Lahore",
    department: "Development",
    position: "Full Stack Developer",
    joinDate: "2024-03-12",
    phone: "+92-300-5678901"
  },
  {
    username: "kamran.shahid",
    firstName: "Kamran",
    lastName: "Shahid",
    email: "kamran.shahid@company.com",
    cnic: "35401-6789012-6",
    password: "employee123",
    salary: 58000,
    address: "987 Digital Valley, Islamabad",
    department: "Development",
    position: "Backend Developer",
    joinDate: "2023-12-05",
    phone: "+92-300-6789012"
  },
  {
    username: "muhammad.azan",
    firstName: "Muhammad",
    lastName: "Azan",
    email: "muhammad.azan@company.com",
    cnic: "35401-7890123-7",
    password: "employee123",
    salary: 45000,
    address: "159 Code Street, Karachi",
    department: "Development",
    position: "Junior Developer",
    joinDate: "2024-04-20",
    phone: "+92-300-7890123"
  },
  {
    username: "muhammad.uzair",
    firstName: "Muhammad",
    lastName: "Uzair",
    email: "muhammad.uzair@company.com",
    cnic: "35401-8901234-8",
    password: "employee123",
    salary: 47000,
    address: "753 Tech City, Lahore",
    department: "Development",
    position: "Mobile Developer",
    joinDate: "2024-01-30",
    phone: "+92-300-8901234"
  }
];

async function createEmployees() {
  console.log('🚀 Starting employee creation process...');
  
  try {
    // Get the default employee role
    const employeeRole = await prisma.role.findUnique({
      where: { name: "Employee" }
    });

    if (!employeeRole) {
      console.log('❌ Employee role not found. Please run the seed script first.');
      return;
    }

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`\n📝 Creating employee ${i + 1}/${employees.length}: ${employee.firstName} ${employee.lastName}`);
      
      try {
        // Check if employee already exists
        const existingEmployee = await prisma.user.findFirst({
          where: {
            OR: [
              { username: employee.username },
              { email: employee.email },
              { cnic: employee.cnic }
            ]
          }
        });

        if (existingEmployee) {
          console.log(`⚠️  Employee already exists: ${employee.firstName} ${employee.lastName}`);
          continue;
        }

        // Hash password
        const hashedPassword = await hash(employee.password, 12);

        // Create employee
        const newEmployee = await prisma.user.create({
          data: {
            username: employee.username,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            cnic: employee.cnic,
            password: hashedPassword,
            salary: employee.salary,
            address: employee.address,
            department: employee.department,
            position: employee.position,
            joinDate: new Date(employee.joinDate),
            phone: employee.phone,
            legacyRole: "EMPLOYEE",
            status: "ACTIVE",
            userRoles: {
              create: {
                roleId: employeeRole.id
              }
            }
          }
        });

        console.log(`✅ Successfully created: ${employee.firstName} ${employee.lastName} (ID: ${newEmployee.id})`);
      } catch (error: any) {
        console.log(`❌ Failed to create ${employee.firstName} ${employee.lastName}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Employee creation process completed!');
    
    // Display summary
    const totalEmployees = await prisma.user.count({
      where: { legacyRole: "EMPLOYEE" }
    });
    console.log(`📊 Total employees in database: ${totalEmployees}`);
    
  } catch (error) {
    console.error('❌ Error in employee creation process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createEmployees().catch(console.error);
} 