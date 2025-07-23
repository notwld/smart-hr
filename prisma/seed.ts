import { PrismaClient } from "../lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default permissions
  const permissions = [
    // User management permissions
    { name: "users.view", description: "View users", resource: "users", action: "view" },
    { name: "users.create", description: "Create users", resource: "users", action: "create" },
    { name: "users.edit", description: "Edit users", resource: "users", action: "edit" },
    { name: "users.delete", description: "Delete users", resource: "users", action: "delete" },
    
    // Leave management permissions
    { name: "leaves.view", description: "View leaves", resource: "leaves", action: "view" },
    { name: "leaves.create", description: "Apply for leave", resource: "leaves", action: "create" },
    { name: "leaves.approve", description: "Approve leaves", resource: "leaves", action: "approve" },
    { name: "leaves.reject", description: "Reject leaves", resource: "leaves", action: "reject" },
    
    // Attendance management
    { name: "attendance.view", description: "View attendance", resource: "attendance", action: "view" },
    { name: "attendance.mark", description: "Mark attendance", resource: "attendance", action: "mark" },
    { name: "attendance.edit", description: "Edit attendance", resource: "attendance", action: "edit" },
    { name: "attendance.create", description: "Create attendance records", resource: "attendance", action: "create" },
    { name: "attendance.import", description: "Import attendance from Excel", resource: "attendance", action: "import" },
    
    // Teams management
    { name: "teams.view", description: "View teams", resource: "teams", action: "view" },
    { name: "teams.create", description: "Create teams", resource: "teams", action: "create" },
    { name: "teams.edit", description: "Edit teams", resource: "teams", action: "edit" },
    { name: "teams.delete", description: "Delete teams", resource: "teams", action: "delete" },
    
    // Reports
    { name: "reports.view", description: "View reports", resource: "reports", action: "view" },
    
    // Dashboard
    { name: "dashboard.view", description: "View dashboard", resource: "dashboard", action: "view" },
    
    // Settings
    { name: "settings.view", description: "View settings", resource: "settings", action: "view" },
    { name: "settings.edit", description: "Edit settings", resource: "settings", action: "edit" },
    
    // Roles and permissions
    { name: "roles.view", description: "View roles", resource: "roles", action: "view" },
    { name: "roles.create", description: "Create roles", resource: "roles", action: "create" },
    { name: "roles.edit", description: "Edit roles", resource: "roles", action: "edit" },
    { name: "roles.delete", description: "Delete roles", resource: "roles", action: "delete" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log("Created default permissions");

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator with full access",
      isDefault: false,
    },
  });

  const teamLeaderRole = await prisma.role.upsert({
    where: { name: "Team Leader" },
    update: {},
    create: {
      name: "Team Leader",
      description: "Team leader with team management permissions",
      isDefault: false,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "Employee" },
    update: {},
    create: {
      name: "Employee",
      description: "Regular employee",
      isDefault: true,
    },
  });

  console.log("Created default roles");

  // Assign permissions to roles
  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  
  // Admin gets all permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Team Leader permissions
  const teamLeaderPermissions = allPermissions.filter(p => 
    p.name === "dashboard.view" ||
    p.name === "users.view" ||
    p.name === "leaves.view" ||
    p.name === "leaves.approve" ||
    p.name === "leaves.reject" ||
    p.name === "attendance.view" ||
    p.name === "teams.view" ||
    p.name === "reports.view" ||
    p.resource === "attendance"
  );

  for (const permission of teamLeaderPermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: {
          roleId: teamLeaderRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: teamLeaderRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Employee permissions
  const employeePermissions = allPermissions.filter(p => 
    p.name === "dashboard.view" ||
    p.name === "leaves.view" ||
    p.name === "leaves.create" ||
    p.name === "attendance.view" ||
    p.name === "attendance.mark" ||
    p.name === "teams.view"
  );

  for (const permission of employeePermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: employeeRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("Assigned permissions to roles");

  // Create a default admin user if it doesn't exist
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@company.com",
      cnic: "00000-0000000-0",
      password: adminPassword,
      salary: 100000,
      address: "Admin Address",
      department: "Administration",
      position: "System Administrator",
      joinDate: new Date(),
      legacyRole: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: { 
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log("Created default admin user");

  // Migrate existing users based on legacy roles
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: admin.id
      }
    }
  });

  for (const user of users) {
    let roleId;
    
    if (user.legacyRole === "ADMIN") {
      roleId = adminRole.id;
    } else if (user.legacyRole === "MANAGER") {
      roleId = teamLeaderRole.id;
    } else {
      roleId = employeeRole.id;
    }

    await prisma.userRole.upsert({
      where: { 
        userId_roleId: {
          userId: user.id,
          roleId: roleId
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roleId,
      },
    });
  }

  console.log("Migrated existing users to new role system");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 