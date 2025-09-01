import EmployeeList from "@/components/employees/EmployeeList";

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full">
        <EmployeeList />
      </div>
    </div>
  );
} 