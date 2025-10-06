"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Heart, CreditCard, Camera, Save, GraduationCap, Building, Plus } from "lucide-react";
import { ButtonLoader } from "@/components/ui/loader";

// Define schema with same validation as EmployeeForm
const employeeSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  cnic: z.string()
    .min(15, "CNIC must be in format XXXXX-XXXXXXX-X")
    .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format XXXXX-XXXXXXX-X"),
  password: z.string().optional(), // Password is optional for updates
  salary: z.coerce.number().min(0, "Salary must be positive"),
  address: z.string().min(5, "Address is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  joinDate: z.string().min(1, "Join date is required"),
  phone: z.string()
    .min(13, "Phone number must be in format +XXXXXXXXXXXX")
    .regex(/^\+\d{12}$/, "Phone number must include country code e.g. +923115798967"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    phone: z.string()
      .min(13, "Phone number must be in format +XXXXXXXXXXXX")
      .regex(/^\+\d{12}$/, "Phone number must include country code e.g. +923115798967"),
    address: z.string().min(5, "Address is required"),
  }),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    field: z.string().min(1, "Field is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    grade: z.string().optional(),
  })),
  experience: z.array(z.object({
    company: z.string().min(1, "Company name is required"),
    position: z.string().min(1, "Position is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
  bankDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    accountTitle: z.string().min(1, "Account title is required"),
    branchCode: z.string().optional(),
  }),
  image: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

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
  joinDate: Date;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | null;
  image: string | null;
  status: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  } | null;
  education?: {
    id: string;
    degree: string;
    institution: string;
    field: string;
    startDate: Date;
    endDate: Date | null;
    grade: string | null;
  }[];
  experience?: {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
  }[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountTitle: string;
    branchCode: string | null;
  } | null;
}

interface EditEmployeeFormProps {
  employee: Employee;
}

export default function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    employee.image || null
  );
  const router = useRouter();

  // Format date to YYYY-MM-DD for form inputs
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };
  
  // Format phone number to ensure it has + prefix
  const formatPhone = (phone: string | null) => {
    if (!phone) return "+";
    if (!phone.startsWith("+")) return `+${phone}`;
    return phone;
  };
  
  // Format CNIC to include dashes
  const formatCNIC = (cnic: string) => {
    if (!cnic) return "";
    // Strip any existing dashes
    const stripped = cnic.replace(/-/g, "");
    // If it's not the right length, return as is
    if (stripped.length !== 13) return cnic;
    // Format with dashes
    return `${stripped.slice(0, 5)}-${stripped.slice(5, 12)}-${stripped.slice(12)}`;
  };

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      username: employee.username,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      cnic: formatCNIC(employee.cnic),
      password: "", // Password field is empty and optional
      salary: employee.salary,
      address: employee.address,
      department: employee.department,
      position: employee.position,
      joinDate: formatDate(employee.joinDate),
      phone: formatPhone(employee.phone),
      dateOfBirth: formatDate(employee.dateOfBirth),
      gender: employee.gender || "MALE",
      maritalStatus: employee.maritalStatus || "SINGLE",
      emergencyContact: employee.emergencyContact ? {
        name: employee.emergencyContact.name,
        relationship: employee.emergencyContact.relationship,
        phone: formatPhone(employee.emergencyContact.phone),
        address: employee.emergencyContact.address,
      } : {
        name: "",
        relationship: "",
        phone: "+",
        address: "",
      },
      education: employee.education?.length ? employee.education.map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
        field: edu.field,
        startDate: formatDate(edu.startDate),
        endDate: edu.endDate ? formatDate(edu.endDate) : undefined,
        grade: edu.grade || undefined,
      })) : [],
      experience: employee.experience?.length ? employee.experience.map((exp) => ({
        company: exp.company,
        position: exp.position,
        startDate: formatDate(exp.startDate),
        endDate: exp.endDate ? formatDate(exp.endDate) : undefined,
        description: exp.description || undefined,
      })) : [],
      bankDetails: employee.bankDetails ? {
        bankName: employee.bankDetails.bankName,
        accountNumber: employee.bankDetails.accountNumber,
        accountTitle: employee.bankDetails.accountTitle,
        branchCode: employee.bankDetails.branchCode || undefined,
      } : {
        bankName: "",
        accountNumber: "",
        accountTitle: "",
        branchCode: "",
      },
      image: employee.image || "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      // If password is empty, remove it from the data
      if (!data.password) {
        delete data.password;
      }

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update employee");
      }

      toast.success("Employee updated successfully");
      router.push("/admin/employees");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      form.setValue('image', data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600">
          <CardHeader className="text-white">
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2" />
              Edit Employee Profile
            </CardTitle>
            <p className="text-white/90 mt-1">Update employee information and details</p>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                  <Camera className="w-5 h-5 mr-2" />
                  Profile Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-cyan-100">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border-cyan-200 focus:border-cyan-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Max file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">First Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">CNIC</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="XXXXX-XXXXXXX-X"
                      onChange={(e) => {
                        // Strip existing dashes first to normalize input
                        let value = e.target.value.replace(/-/g, '');
                        
                        // Only allow digits
                        value = value.replace(/[^\d]/g, '');
                        
                        // Limit to 13 digits
                        value = value.slice(0, 13);
                        
                        // Add dashes at appropriate positions if we have enough digits
                        if (value.length > 5) {
                          value = value.slice(0, 5) + '-' + value.slice(5);
                        }
                        if (value.length > 13) {
                          value = value.slice(0, 13) + '-' + value.slice(13);
                        }
                        
                        // Set the formatted value
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+923115798967"
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Ensure the value starts with +
                        if (!value.startsWith('+')) {
                          value = '+' + value;
                        }
                        
                        // Only allow + at start and digits after
                        value = '+' + value.slice(1).replace(/[^\d]/g, '');
                        
                        // Limit to 13 characters total (+ and 12 digits)
                        value = value.slice(0, 13);
                        
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password (leave empty to keep unchanged)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Department</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Position</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Salary</FormLabel>
                  <FormControl>
                                          <Input 
                      type="number" 
                      {...field} 
                      className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Join Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Relationship</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Phone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="+923115798967"
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Ensure the value starts with +
                        if (!value.startsWith('+')) {
                          value = '+' + value;
                        }
                        
                        // Only allow + at start and digits after
                        value = '+' + value.slice(1).replace(/[^\d]/g, '');
                        
                        // Limit to 13 characters total (+ and 12 digits)
                        value = value.slice(0, 13);
                        
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                </div>
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bankDetails.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankDetails.accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankDetails.accountTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Account Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankDetails.branchCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Branch Code</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                </div>
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
                {form.watch("education").length > 0 && form.watch("education").map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Degree</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Institution</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.field`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Field</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Grade</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("education", [
                      ...form.watch("education"),
                      {
                        degree: "",
                        institution: "",
                        field: "",
                        startDate: "",
                        endDate: "",
                        grade: "",
                      },
                    ])
                  }
                  className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                  <Building className="w-5 h-5 mr-2" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("experience").map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Company</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Position</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("experience", [
                      ...form.watch("experience"),
                      {
                        company: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        description: "",
                      },
                    ])
                  }
                  className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-cyan-500 to-blue-600">
              <CardContent className="p-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-cyan-600 hover:bg-gray-100 font-semibold py-3 text-lg shadow-lg"
                >
                  {loading ? (
                    <ButtonLoader size="md" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Employee
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
} 