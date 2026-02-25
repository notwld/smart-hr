"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { safeFormatDate } from "@/lib/utils";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Heart,
  GraduationCap,
  Building,
  CreditCard,
  ArrowLeft
} from "lucide-react";

interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  cnic: string;
  salary: number;
  address: string;
  department: string;
  position: string;
  joinDate: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  image: string | null;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  } | null;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    startDate: string;
    endDate: string | null;
    grade: string | null;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountTitle: string;
    branchCode: string | null;
  } | null;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Unwrap params with React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    fetchEmployee();
  }, [resolvedParams.id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch employee");
      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      toast.error("Error loading employee details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch(`/api/employees/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      toast.success("Employee deleted successfully");
      router.push("/admin/employees");
    } catch (error) {
      toast.error("Error deleting employee");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <Loader size="lg" text="Loading employee details..." />
    </div>
  );
  
  if (!employee) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <Card className="p-8 text-center">
        <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Employee not found</h2>
        <p className="text-gray-500">The requested employee could not be found.</p>
        <Button onClick={() => router.push('/admin/employees')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600">
          <CardHeader className="text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Employee Details
                </CardTitle>
                <p className="text-white/90 mt-1">Comprehensive employee information and records</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => router.push('/admin/employees')}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => router.push(`/admin/employees/${resolvedParams.id}/edit`)}
                  className="bg-white text-cyan-600 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Employee
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Section */}
          <Card className="lg:col-span-1 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-cyan-100 shadow-lg">
                  {employee.image ? (
                    <Image
                      src={employee?.image ?? ""}
                      alt={`${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {(employee?.firstName ?? "").charAt(0)}{(employee?.lastName ?? "").charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {employee?.firstName ?? ""} {employee?.lastName ?? ""}
                  </h2>
                  <div className="space-y-2">
                    <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 font-medium">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {employee?.position ?? "—"}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                      <Building className="w-3 h-3 mr-1" />
                      {employee?.department ?? "—"}
                    </Badge>
                  </div>
                  <div className="pt-4 space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="truncate">{employee?.email ?? "—"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-cyan-500" />
                      <span>{employee?.phone ?? "—"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                      <span>Joined {safeFormatDate(employee.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-3 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Username</p>
                  <p className="text-gray-800 font-medium">{employee?.username ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                  <p className="text-gray-800 font-medium">{employee?.email ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">CNIC</p>
                  <p className="text-gray-800 font-medium font-mono">{employee?.cnic ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                  <p className="text-gray-800 font-medium font-mono">{employee?.phone ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-gray-800 font-medium">{safeFormatDate(employee.dateOfBirth, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {employee?.gender ?? "—"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Marital Status</p>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {employee?.maritalStatus ?? "—"}
                  </Badge>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="text-gray-800 font-medium flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-cyan-500 flex-shrink-0" />
                    {employee?.address ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employment Information */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <Briefcase className="w-5 h-5 mr-2" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Department</p>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                  <Building className="w-3 h-3 mr-1" />
                  {employee?.department ?? "—"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Position</p>
                <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 font-medium">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {employee?.position ?? "—"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Join Date</p>
                <p className="text-gray-800 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                  {safeFormatDate(employee.joinDate, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Salary</p>
                <p className="text-gray-800 font-bold text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-1 text-green-500" />
                  {employee.salary.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <Heart className="w-5 h-5 mr-2" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {employee.emergencyContact ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contact Name</p>
                  <p className="text-gray-800 font-medium">{employee.emergencyContact.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Relationship</p>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <Heart className="w-3 h-3 mr-1" />
                    {employee.emergencyContact.relationship}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                  <p className="text-gray-800 font-medium font-mono flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-cyan-500" />
                    {employee.emergencyContact.phone}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="text-gray-800 font-medium flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-cyan-500 flex-shrink-0" />
                    {employee.emergencyContact.address}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No emergency contact information available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <GraduationCap className="w-5 h-5 mr-2" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(employee.education ?? []).length > 0 ? (
              <div className="space-y-6">
                {(employee.education ?? []).map((edu, index) => (
                  <div key={index} className="p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{edu?.degree ?? "—"}</h3>
                        <p className="text-cyan-600 font-medium mb-1">{edu?.institution ?? "—"}</p>
                        <p className="text-gray-600">{edu?.field ?? "—"}</p>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Education
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {safeFormatDate(edu.startDate)} - {edu.endDate ? safeFormatDate(edu.endDate) : "Present"}
                      </div>
                      {edu.grade && (
                        <div className="flex items-center">
                          <span className="font-medium">Grade: {edu.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No education records found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <Building className="w-5 h-5 mr-2" />
              Professional Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(employee.experience ?? []).length > 0 ? (
              <div className="space-y-6">
                {(employee.experience ?? []).map((exp, index) => (
                  <div key={index} className="p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{exp?.position ?? "—"}</h3>
                        <p className="text-blue-600 font-medium mb-2">{exp?.company ?? "—"}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          {safeFormatDate(exp.startDate)} - {exp.endDate ? safeFormatDate(exp.endDate) : "Present"}
                        </div>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        <Building className="w-3 h-3 mr-1" />
                        Experience
                      </Badge>
                    </div>
                    {exp.description && (
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No work experience records found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <CreditCard className="w-5 h-5 mr-2" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {employee.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Bank Name</p>
                  <p className="text-gray-800 font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-cyan-500" />
                    {employee.bankDetails?.bankName ?? "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Number</p>
                  <p className="text-gray-800 font-medium font-mono bg-gray-50 px-3 py-2 rounded border">
                    {employee.bankDetails?.accountNumber ?? "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Title</p>
                  <p className="text-gray-800 font-medium">{employee.bankDetails?.accountTitle ?? "—"}</p>
                </div>
                {employee.bankDetails?.branchCode && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Branch Code</p>
                    <p className="text-gray-800 font-medium font-mono">{employee.bankDetails?.branchCode}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bank details available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 