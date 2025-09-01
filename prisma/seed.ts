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
    { name: "leaves.edit", description: "Edit leaves", resource: "leaves", action: "edit" },
    { name: "leaves.delete", description: "Delete leaves", resource: "leaves", action: "delete" },
    
    // Attendance management
    { name: "attendance.view", description: "View attendance", resource: "attendance", action: "view" },
    { name: "attendance.mark", description: "Mark attendance", resource: "attendance", action: "mark" },
    { name: "attendance.edit", description: "Edit attendance", resource: "attendance", action: "edit" },
    { name: "attendance.create", description: "Create attendance records", resource: "attendance", action: "create" },
    { name: "attendance.import", description: "Import attendance from Excel", resource: "attendance", action: "import" },
    { name: "attendance.delete", description: "Delete attendance records", resource: "attendance", action: "delete" },
    
    // Teams management
    { name: "teams.view", description: "View teams", resource: "teams", action: "view" },
    { name: "teams.create", description: "Create teams", resource: "teams", action: "create" },
    { name: "teams.edit", description: "Edit teams", resource: "teams", action: "edit" },
    { name: "teams.delete", description: "Delete teams", resource: "teams", action: "delete" },
    { name: "teams.manage", description: "Manage team members", resource: "teams", action: "manage" },
    
    // Leads management
    { name: "leads.view", description: "View leads", resource: "leads", action: "view" },
    { name: "leads.create", description: "Create leads", resource: "leads", action: "create" },
    { name: "leads.edit", description: "Edit leads", resource: "leads", action: "edit" },
    { name: "leads.delete", description: "Delete leads", resource: "leads", action: "delete" },
    { name: "leads.assign", description: "Assign leads to team members", resource: "leads", action: "assign" },
    { name: "leads.import", description: "Import leads from Excel", resource: "leads", action: "import" },
    { name: "leads.export", description: "Export leads data", resource: "leads", action: "export" },
    
    // Chat and communication
    { name: "chat.view", description: "View chat messages", resource: "chat", action: "view" },
    { name: "chat.send", description: "Send chat messages", resource: "chat", action: "send" },
    { name: "chat.delete", description: "Delete chat messages", resource: "chat", action: "delete" },
    { name: "chat.moderate", description: "Moderate chat rooms", resource: "chat", action: "moderate" },
    { name: "chat.create_room", description: "Create chat rooms", resource: "chat", action: "create_room" },
    
    // Hosting management
    { name: "hosting.view", description: "View hosting records", resource: "hosting", action: "view" },
    { name: "hosting.create", description: "Create hosting records", resource: "hosting", action: "create" },
    { name: "hosting.edit", description: "Edit hosting records", resource: "hosting", action: "edit" },
    { name: "hosting.delete", description: "Delete hosting records", resource: "hosting", action: "delete" },
    
    // Reports
    { name: "reports.view", description: "View reports", resource: "reports", action: "view" },
    { name: "reports.create", description: "Generate reports", resource: "reports", action: "create" },
    { name: "reports.export", description: "Export reports", resource: "reports", action: "export" },
    
    // Dashboard
    { name: "dashboard.view", description: "View dashboard", resource: "dashboard", action: "view" },
    { name: "dashboard.admin", description: "View admin dashboard", resource: "dashboard", action: "admin" },

    // Onboarding
    { name: "onboarding.view", description: "Access onboarding page", resource: "onboarding", action: "view" },
    { name: "onboarding.complete", description: "Complete onboarding process", resource: "onboarding", action: "complete" },
    
    // Settings
    { name: "settings.view", description: "View settings", resource: "settings", action: "view" },
    { name: "settings.edit", description: "Edit settings", resource: "settings", action: "edit" },
    
    // Roles and permissions
    { name: "roles.view", description: "View roles", resource: "roles", action: "view" },
    { name: "roles.create", description: "Create roles", resource: "roles", action: "create" },
    { name: "roles.edit", description: "Edit roles", resource: "roles", action: "edit" },
    { name: "roles.delete", description: "Delete roles", resource: "roles", action: "delete" },
    { name: "permissions.view", description: "View permissions", resource: "permissions", action: "view" },
    { name: "permissions.assign", description: "Assign permissions to roles", resource: "permissions", action: "assign" },
    
    // Performance and tasks
    { name: "performance.view", description: "View performance records", resource: "performance", action: "view" },
    { name: "performance.create", description: "Create performance records", resource: "performance", action: "create" },
    { name: "performance.edit", description: "Edit performance records", resource: "performance", action: "edit" },
    { name: "tasks.view", description: "View tasks", resource: "tasks", action: "view" },
    { name: "tasks.create", description: "Create tasks", resource: "tasks", action: "create" },
    { name: "tasks.edit", description: "Edit tasks", resource: "tasks", action: "edit" },
    { name: "tasks.delete", description: "Delete tasks", resource: "tasks", action: "delete" },
    { name: "tasks.assign", description: "Assign tasks to users", resource: "tasks", action: "assign" },
    
    // Projects
    { name: "projects.view", description: "View projects", resource: "projects", action: "view" },
    { name: "projects.create", description: "Create projects", resource: "projects", action: "create" },
    { name: "projects.edit", description: "Edit projects", resource: "projects", action: "edit" },
    { name: "projects.delete", description: "Delete projects", resource: "projects", action: "delete" },
    { name: "projects.assign", description: "Assign users to projects", resource: "projects", action: "assign" },
    
    // Notifications and meetings
    { name: "notifications.view", description: "View notifications", resource: "notifications", action: "view" },
    { name: "notifications.send", description: "Send notifications", resource: "notifications", action: "send" },
    { name: "meetings.view", description: "View meetings", resource: "meetings", action: "view" },
    { name: "meetings.create", description: "Create meetings", resource: "meetings", action: "create" },
    { name: "meetings.edit", description: "Edit meetings", resource: "meetings", action: "edit" },
    { name: "meetings.delete", description: "Delete meetings", resource: "meetings", action: "delete" },

    // Kanban boards
    { name: "kanban.view", description: "View Kanban boards", resource: "kanban", action: "view" },
    { name: "kanban.create", description: "Create Kanban boards", resource: "kanban", action: "create" },
    { name: "kanban.edit", description: "Edit Kanban boards", resource: "kanban", action: "edit" },
    { name: "kanban.delete", description: "Delete Kanban boards", resource: "kanban", action: "delete" },
    { name: "kanban.manage", description: "Manage board members and permissions", resource: "kanban", action: "manage" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

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
    p.name === "leaves.edit" ||
    p.name === "attendance.view" ||
    p.name === "attendance.edit" ||
    p.name === "attendance.create" ||
    p.name === "teams.view" ||
    p.name === "teams.manage" ||
    p.name === "leads.view" ||
    p.name === "leads.create" ||
    p.name === "leads.edit" ||
    p.name === "leads.assign" ||
    p.name === "chat.view" ||
    p.name === "chat.send" ||
    p.name === "chat.moderate" ||
    p.name === "reports.view" ||
    p.name === "reports.create" ||
    p.name === "tasks.view" ||
    p.name === "tasks.create" ||
    p.name === "tasks.edit" ||
    p.name === "tasks.assign" ||
    p.name === "projects.view" ||
    p.name === "projects.create" ||
    p.name === "projects.edit" ||
    p.name === "projects.assign" ||
    p.name === "meetings.view" ||
    p.name === "meetings.create" ||
    p.name === "performance.view" ||
    p.name === "performance.create" ||
    p.name === "kanban.view" ||
    p.name === "kanban.create" ||
    p.name === "kanban.edit" ||
    p.name === "kanban.manage"
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
    p.name === "teams.view" ||
    p.name === "chat.view" ||
    p.name === "chat.send" ||
    p.name === "tasks.view" ||
    p.name === "tasks.create" ||
    p.name === "projects.view" ||
    p.name === "meetings.view" ||
    p.name === "notifications.view" ||
    p.name === "onboarding.view" ||
    p.name === "onboarding.complete" ||
    p.name === "kanban.view" ||
    p.name === "kanban.create" ||
    p.name === "kanban.edit"
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

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 