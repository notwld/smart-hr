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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import PermissionGuard from "@/components/PermissionGuard";
import { ButtonLoader, OverlayLoader } from "@/components/ui/loader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  GraduationCap,
  Briefcase,
  Users,
  Camera,
  CheckCircle,
  Building,
  DollarSign,
  Lock,
  LogOut,
  AlertCircle,
  XCircle,
} from "lucide-react";

const onboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  cnic: z.string()
    .min(15, "CNIC must be in format XXXXX-XXXXXXX-X")
    .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format XXXXX-XXXXXXX-X"),
  address: z.string().min(5, "Address is required"),
  phone: z.string()
    .min(13, "Phone number must be in format +XXXXXXXXXXXX")
    .regex(/^\+\d{12}$/, "Phone number must include country code e.g. +923115798967"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),

  // Employment Information
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  salary: z.coerce.number().min(0, "Salary must be positive"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    phone: z.string()
      .min(13, "Phone number must be in format +XXXXXXXXXXXX")
      .regex(/^\+\d{12}$/, "Phone number must include country code e.g. +923115798967"),
    address: z.string().min(5, "Address is required"),
  }),

  // Education (optional)
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    field: z.string().min(1, "Field is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    grade: z.string().optional(),
  })).optional(),

  // Experience (optional)
  experience: z.array(z.object({
    company: z.string().min(1, "Company name is required"),
    position: z.string().min(1, "Position is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).optional(),

  // Bank Details
  bankDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    accountTitle: z.string().min(1, "Account title is required"),
    branchCode: z.string().optional(),
  }),

  // Profile Image
  image: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      cnic: "",
      address: "",
      phone: "",
      dateOfBirth: "",
      gender: "MALE",
      maritalStatus: "SINGLE",
      department: "",
      position: "",
      salary: 0,
      password: "",
      confirmPassword: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        address: "",
      },
      education: [],
      experience: [],
      bankDetails: {
        bankName: "",
        accountNumber: "",
        accountTitle: "",
        branchCode: "",
      },
      image: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(null);

    setLoading(true);
    try {
      // Upload image if exists
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        data.image = imageUrl;
      }
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = responseData.message || "Failed to complete onboarding";
        
        // Make error messages more user-friendly
        if (errorMessage.includes("Missing required fields")) {
          errorMessage = "Please fill in all required fields. Check all steps and ensure no mandatory fields are empty.";
        } else if (errorMessage.includes("Email already exists")) {
          errorMessage = "This email address is already registered in our system.";
        } else if (errorMessage.includes("CNIC already exists")) {
          errorMessage = "This CNIC number is already registered in our system.";
        } else if (errorMessage.includes("Unique constraint")) {
          errorMessage = "Some information you entered is already in use. Please check your email and CNIC.";
        }
        
        setSubmitError(errorMessage);
        
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

            setSubmitSuccess("Onboarding completed successfully! Welcome aboard! 🎉\nA welcome email with login instructions has been sent to your email address.");

      // Update the session with the new user data
      await updateSession();

      // Redirect after a delay to allow user to read the success message
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 3000);
      
    } catch (error: any) {
      console.error("❌ Error completing onboarding:", error);
      let errorMessage = error.message || "Failed to complete onboarding";
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setSubmitError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

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

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const steps = [
    { id: 1, title: "Personal & Employment Info", icon: User },
    { id: 2, title: "Contact & Emergency", icon: Phone },
    { id: 3, title: "Education & Experience", icon: GraduationCap },
    { id: 4, title: "Bank Details", icon: CreditCard },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      // Clear any existing error messages when moving to next step
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear any existing error messages when moving to previous step
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  };

  // Function to determine which step contains validation errors
  const getStepWithErrors = (errors: any): number => {
    const errorFields = Object.keys(errors);
    
    // Step 1 fields
    const step1Fields = ['firstName', 'lastName', 'email', 'cnic', 'phone', 'dateOfBirth', 'gender', 'maritalStatus', 'department', 'position', 'salary', 'password', 'confirmPassword', 'address'];
    // Step 2 fields  
    const step2Fields = ['emergencyContact'];
    // Step 3 fields (education and experience are optional)
    const step3Fields = ['education', 'experience'];
    // Step 4 fields
    const step4Fields = ['bankDetails'];
    
    if (errorFields.some(field => step1Fields.includes(field))) return 1;
    if (errorFields.some(field => step2Fields.includes(field) || field.startsWith('emergencyContact'))) return 2;
    if (errorFields.some(field => step3Fields.includes(field) || field.startsWith('education') || field.startsWith('experience'))) return 3;
    if (errorFields.some(field => step4Fields.includes(field) || field.startsWith('bankDetails'))) return 4;
    
    return 1; // Default to step 1
  };

  const checkFormValidation = () => {
    const errors = form.formState.errors;

    if (Object.keys(errors).length > 0) {
      const errorMessages: string[] = [];
      
      // Collect error messages with user-friendly field names
      Object.entries(errors).forEach(([field, error]: [string, any]) => {
        const fieldName = field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace('Emergency Contact', 'Emergency contact')
          .replace('Bank Details', 'Bank details');
        
        if (error?.message) {
          errorMessages.push(`${fieldName}: ${error.message}`);
        }
      });
      
      // Set error message
      const fullErrorMessage = `Please fix the following errors:\n\n${errorMessages.join('\n')}`;
      setSubmitError(fullErrorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      return false;
    }
    
    // Additional validation for required fields
    const values = form.getValues();
    const missingFields: string[] = [];
    
    if (!values.firstName) missingFields.push('First Name');
    if (!values.lastName) missingFields.push('Last Name');
    if (!values.email) missingFields.push('Email');
    if (!values.cnic) missingFields.push('CNIC');
    if (!values.phone) missingFields.push('Phone');
    if (!values.dateOfBirth) missingFields.push('Date of Birth');
    if (!values.address) missingFields.push('Address');
    if (!values.department) missingFields.push('Department');
    if (!values.position) missingFields.push('Position');
    if (!values.salary || values.salary <= 0) missingFields.push('Valid Salary');
    if (!values.password) missingFields.push('Password');
    if (!values.confirmPassword) missingFields.push('Confirm Password');
    if (!values.emergencyContact?.name) missingFields.push('Emergency Contact Name');
    if (!values.emergencyContact?.phone) missingFields.push('Emergency Contact Phone');
    if (!values.emergencyContact?.relationship) missingFields.push('Emergency Contact Relationship');
    if (!values.emergencyContact?.address) missingFields.push('Emergency Contact Address');
    if (!values.bankDetails?.bankName) missingFields.push('Bank Name');
    if (!values.bankDetails?.accountNumber) missingFields.push('Account Number');
    if (!values.bankDetails?.accountTitle) missingFields.push('Account Title');
    
    if (missingFields.length > 0) {
      const errorMessage = `The following required fields are missing:\n\n${missingFields.join(', ')}\n\nPlease go back and fill in all required fields marked with (*).`;
      setSubmitError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  return (
    <PermissionGuard
      permissions="onboarding.view"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
          <div className="text-center bg-[#dff9ff] p-8 rounded-lg shadow-lg border-0">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access onboarding.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-sm border-b border-cyan-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white">Mize Technologies Employee Onboarding</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
              Step {currentStep} of {steps.length}
            </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-white hover:bg-white/20 hover:text-white border border-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id <= currentStep
                      ? 'bg-white text-cyan-600 shadow-sm'
                      : 'bg-white/30 text-white/70'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs mt-1 ${
                    step.id <= currentStep ? 'text-white font-medium' : 'text-white/70'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out shadow-sm"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Error/Success Messages */}
      {(submitError || submitSuccess) && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700 whitespace-pre-line">
                    {submitError}
                  </div>
                </div>
                <button
                  onClick={() => setSubmitError(null)}
                  className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-600 p-1.5 hover:bg-red-100 inline-flex h-8 w-8"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-1 text-sm text-green-700">
                    {submitSuccess}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {loading && <OverlayLoader text="Completing your onboarding..." />}
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-full">

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-lg bg-[#dff9ff]">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal & Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-[#dff9ff]">

                  {/* Profile Image */}
                  <div className="flex justify-center">
                    <div className="space-y-4">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg">
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
                      <div className="text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="max-w-xs mx-auto"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max file size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            First Name *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Last Name *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            CNIC *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="XXXXX-XXXXXXX-X"
                              className="border-cyan-200 focus:border-cyan-500"
                              onChange={(e) => {
                                let value = e.target.value.replace(/-/g, '');
                                value = value.replace(/[^\d]/g, '');
                                value = value.slice(0, 13);
                                if (value.length > 5) {
                                  value = value.slice(0, 5) + '-' + value.slice(5);
                                }
                                if (value.length > 13) {
                                  value = value.slice(0, 13) + '-' + value.slice(13);
                                }
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
                          <FormLabel className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Phone *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+923213213131"
                              className="border-cyan-200 focus:border-cyan-500"
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!value.startsWith('+')) {
                                  value = '+' + value;
                                }
                                value = '+' + value.slice(1).replace(/[^\d]/g, '');
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
                          <FormLabel className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Date of Birth *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-cyan-200 focus:border-cyan-500">
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
                          <FormLabel>Marital Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-cyan-200 focus:border-cyan-500">
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

                  {/* Employment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Department *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            Position *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Salary *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="border-cyan-200 focus:border-cyan-500"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Lock className="w-4 h-4 mr-1" />
                            New Password *
                          </FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="border-cyan-200 focus:border-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Lock className="w-4 h-4 mr-1" />
                            Confirm Password *
                          </FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="border-cyan-200 focus:border-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Address *
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} className="border-cyan-200 focus:border-cyan-500 min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Contact & Emergency */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-lg bg-[#dff9ff]">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-[#dff9ff]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Contact Name *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Relationship *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Phone *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+923115798967"
                              className="border-cyan-200 focus:border-cyan-500"
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!value.startsWith('+')) {
                                  value = '+' + value;
                                }
                                value = '+' + value.slice(1).replace(/[^\d]/g, '');
                                value = value.slice(0, 13);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="emergencyContact.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Address *
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} className="border-cyan-200 focus:border-cyan-500 min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Education & Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Education Section */}
                <Card className="border-0 shadow-lg bg-[#dff9ff]">
                  <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Education (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-[#dff9ff]">
                    {(form.watch("education") || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No education records added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            form.setValue("education", [{
                              degree: "",
                              institution: "",
                              field: "",
                              startDate: "",
                              endDate: "",
                              grade: "",
                            }]);
                          }}
                        >
                          Add Education
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(form.watch("education") || []).map((_, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-cyan-200 rounded-lg bg-white/70 backdrop-blur-sm">
                            <FormField
                              control={form.control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input type="date" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input type="date" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue("education", [
                                ...(form.watch("education") || []),
                                {
                                  degree: "",
                                  institution: "",
                                  field: "",
                                  startDate: "",
                                  endDate: "",
                                  grade: "",
                                },
                              ]);
                            }}
                          >
                            Add Another Education
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Experience Section */}
                <Card className="border-0 shadow-lg bg-[#dff9ff]">
                  <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Work Experience (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-[#dff9ff]">
                    {(form.watch("experience") || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No work experience records added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            form.setValue("experience", [{
                              company: "",
                              position: "",
                              startDate: "",
                              endDate: "",
                              description: "",
                            }]);
                          }}
                        >
                          Add Experience
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(form.watch("experience") || []).map((_, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-cyan-200 rounded-lg bg-white/70 backdrop-blur-sm">
                            <FormField
                              control={form.control}
                              name={`experience.${index}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input type="date" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Input type="date" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                                    <Textarea {...field} className="border-cyan-200 focus:border-cyan-500 min-h-[80px]" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue("experience", [
                                ...(form.watch("experience") || []),
                                {
                                  company: "",
                                  position: "",
                                  startDate: "",
                                  endDate: "",
                                  description: "",
                                },
                              ]);
                            }}
                          >
                            Add Another Experience
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <Card className="border-0 shadow-lg bg-[#dff9ff]">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-[#dff9ff]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Bank Name *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Account Number *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Account Title *
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                          <FormLabel className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Branch Code
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="border-cyan-200 focus:border-cyan-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-8"
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8"
                  onClick={(e) => {
                    // Clear previous messages
                    setSubmitError(null);
                    setSubmitSuccess(null);

                    // Check if form is valid
                    if (!checkFormValidation()) {
                      e.preventDefault();
                      return;
                    }

                    // Don't prevent default - let form handle the submission
                  }}
                >
                  {loading ? (
                    <ButtonLoader size="sm" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
        </div>
      </main>
    </div>
    </PermissionGuard>
  );
}
