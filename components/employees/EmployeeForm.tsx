"use client";

import { useState, useRef } from "react";
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

const employeeSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  cnic: z.string()
    .min(15, "CNIC must be in format XXXXX-XXXXXXX-X")
    .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format XXXXX-XXXXXXX-X"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

export default function EmployeeForm() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const router = useRouter();
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      cnic: "",
      password: "",
      salary: 0,
      address: "",
      department: "",
      position: "",
      joinDate: "",
      phone: "",
      dateOfBirth: "",
      gender: "MALE",
      maritalStatus: "SINGLE",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        address: "",
      },
      education: [{
        degree: "",
        institution: "",
        field: "",
        startDate: "",
        endDate: "",
        grade: "",
      }],
      experience: [{
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      }],
      bankDetails: {
        bankName: "",
        accountNumber: "",
        accountTitle: "",
        branchCode: "",
      },
      image: "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      // Upload image if exists
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        data.image = imageUrl;
      }

      // Proceed with employee creation
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle username unique constraint error
        if (response.status === 400 && responseData.message?.includes("username")) {
          setUsernameError("Username already exists. Please choose another one.");
          form.setError("username", { 
            type: "manual", 
            message: "Username already exists. Please choose another one." 
          });
          throw new Error("Username already exists");
        }
        throw new Error(responseData.message || "Failed to create employee");
      }

      toast.success("Employee created successfully");
      router.push("/admin/employees");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating employee:", error);
      if (!error.message.includes("Username already exists")) {
        toast.error(error.message || "Failed to create employee");
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload image without form submission
  const uploadImage = async (file: File): Promise<string> => {
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
    return data.url;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Store the file for later upload during form submission
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate username from first and last name
  const generateUsername = () => {
    const firstName = form.getValues("firstName").toLowerCase();
    const lastName = form.getValues("lastName").toLowerCase();
    
    if (firstName && lastName) {
      const timestamp = new Date().getTime().toString().slice(-4);
      const username = `${firstName}.${lastName}${timestamp}`;
      form.setValue("username", username);
      setUsernameError(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Profile Image</h2>
          <div className="flex items-center space-x-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Max file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear the username error when first name changes
                        setUsernameError(null);
                      }}
                    />
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear the username error when last name changes
                        setUsernameError(null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input 
                        {...field} 
                        className={usernameError ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateUsername}
                    >
                      Generate
                    </Button>
                  </div>
                  {usernameError && (
                    <p className="text-sm font-medium text-red-500">{usernameError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>CNIC</FormLabel>
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
                  <FormLabel>Phone</FormLabel>
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
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
          </div>
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Employment Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
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
                  <FormLabel>Join Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Phone</FormLabel>
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Education</h2>
          {form.watch("education").map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
          >
            Add Education
          </Button>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Experience</h2>
          {form.watch("experience").map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`experience.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
          >
            Add Experience
          </Button>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Bank Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankDetails.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Account Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Branch Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Employee"}
        </Button>
      </form>
    </Form>
  );
} 