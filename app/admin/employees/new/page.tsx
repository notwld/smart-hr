import { Button } from "@/components/ui/button";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/employees">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Employee</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <EmployeeForm />
      </div>
    </div>
  );
} 