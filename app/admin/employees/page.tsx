import EmployeeList from "@/components/employees/EmployeeList";

export default function EmployeesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <EmployeeList />
    </div>
  );
} 