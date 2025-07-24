import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import EditEmployeeForm from "@/components/employees/EditEmployeeForm";

export const metadata: Metadata = {
  title: "Edit Employee | Mize Technologies Portal",
  description: "Edit employee information",
};

async function getEmployee(id: string) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        documents: true,
        bankDetails: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error fetching employee:", error);
    return null;
  }
}

export default async function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin permission
  if (session.user.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  const employee = await getEmployee(params.id);

  if (!employee) {
    redirect("/admin/employees");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Employee</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <EditEmployeeForm employee={employee} />
      </div>
    </div>
  );
} 