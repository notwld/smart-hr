"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Image from "next/image";

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
  };
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
  };
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`);
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
      const response = await fetch(`/api/employees/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      toast.success("Employee deleted successfully");
      router.push("/admin/employees");
    } catch (error) {
      toast.error("Error deleting employee");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Details</h1>
        <div className="space-x-4">
          <Button onClick={() => router.push(`/admin/employees/${params.id}/edit`)}>
            Edit Employee
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48 rounded-full overflow-hidden">
                {employee.image ? (
                  <Image
                    src={employee.image}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-muted-foreground">{employee.position}</p>
                <p className="text-muted-foreground">{employee.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p>{employee.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CNIC</p>
                <p>{employee.cnic}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{employee.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p>{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p>{employee.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marital Status</p>
                <p>{employee.maritalStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{employee.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p>{employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p>{employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p>{new Date(employee.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p>${employee.salary.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accordion Sections */}
        <div className="md:col-span-2 space-y-4">
          {/* Emergency Contact Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="emergency-contact">
              <AccordionTrigger className="text-lg font-semibold">
                Emergency Contact
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{employee.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship</p>
                        <p>{employee.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{employee.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p>{employee.emergencyContact.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Education Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="education">
              <AccordionTrigger className="text-lg font-semibold">
                Education
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {employee.education.map((edu, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          <p className="text-muted-foreground">{edu.field}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(edu.startDate).toLocaleDateString()} -{" "}
                            {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Present"}
                          </p>
                          {edu.grade && <p className="text-sm text-muted-foreground">Grade: {edu.grade}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Experience Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="experience">
              <AccordionTrigger className="text-lg font-semibold">
                Experience
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {employee.experience.map((exp, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <h3 className="font-semibold">{exp.position}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(exp.startDate).toLocaleDateString()} -{" "}
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Bank Details Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="bank-details">
              <AccordionTrigger className="text-lg font-semibold">
                Bank Details
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p>{employee.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p>{employee.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Title</p>
                        <p>{employee.bankDetails.accountTitle}</p>
                      </div>
                      {employee.bankDetails.branchCode && (
                        <div>
                          <p className="text-sm text-muted-foreground">Branch Code</p>
                          <p>{employee.bankDetails.branchCode}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
} 