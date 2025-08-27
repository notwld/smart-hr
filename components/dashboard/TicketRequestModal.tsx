"use client";

import React, { useState } from "react";
import {
  Ticket,
  Plus,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  HelpCircle,
  Wrench,
  Users,
  Calendar,
  DollarSign,
  Monitor,
  Lock,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ButtonLoader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface TicketRequestModalProps {
  onTicketCreated?: () => void;
}

export default function TicketRequestModal({ onTicketCreated }: TicketRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
    dueDate: "",
  });

  const categories = [
    {
      value: "TECHNICAL",
      label: "Technical Issue",
      description: "Software bugs, system errors, or technical problems",
      icon: Monitor,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    {
      value: "HR",
      label: "HR Related",
      description: "Human resources, policies, or personnel matters",
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    {
      value: "LEAVE",
      label: "Leave Request",
      description: "Questions about leave policies or requests",
      icon: Calendar,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      value: "PAYROLL",
      label: "Payroll",
      description: "Salary, benefits, or compensation issues",
      icon: DollarSign,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200"
    },
    {
      value: "EQUIPMENT",
      label: "Equipment",
      description: "Office equipment, supplies, or maintenance",
      icon: Wrench,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200"
    },
    {
      value: "ACCESS",
      label: "Access Request",
      description: "System access, permissions, or login issues",
      icon: Lock,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200"
    },
    {
      value: "TRAINING",
      label: "Training",
      description: "Training requests or learning opportunities",
      icon: BookOpen,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200"
    },
    {
      value: "OTHER",
      label: "Other",
      description: "Any other type of request or issue",
      icon: MessageSquare,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200"
    },
  ];

  const priorities = [
    {
      value: "LOW",
      label: "Low Priority",
      description: "General inquiries or minor issues",
      icon: HelpCircle,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      responseTime: "2-3 business days"
    },
    {
      value: "MEDIUM",
      label: "Medium Priority",
      description: "Standard requests that need attention",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      responseTime: "1 business day"
    },
    {
      value: "HIGH",
      label: "High Priority",
      description: "Important issues requiring prompt attention",
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      responseTime: "4-6 hours"
    },
    {
      value: "CRITICAL",
      label: "Critical Priority",
      description: "Urgent issues affecting work or business",
      icon: Zap,
      color: "bg-red-100 text-red-800 border-red-200",
      responseTime: "1-2 hours"
    },
  ];

  const steps = [
    { id: 1, title: "Category & Priority", description: "Select the type and urgency" },
    { id: 2, title: "Details", description: "Provide issue description" },
    { id: 3, title: "Review & Submit", description: "Confirm and submit your ticket" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Ticket #${result.ticketNumber} submitted successfully! We'll get back to you soon.`);
        setIsOpen(false);
        resetForm();
        onTicketCreated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Error submitting ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "OTHER",
      priority: "MEDIUM",
      dueDate: "",
    });
    setCurrentStep(1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const selectedPriority = priorities.find(pri => pri.value === formData.priority);

  const CategoryIcon = selectedCategory?.icon || MessageSquare;
  const PriorityIcon = selectedPriority?.icon || HelpCircle;

  return (
  <div className="w-100">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Submit Support Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Create Support Ticket</DialogTitle>
              <p className="text-gray-600 mt-1">Get help from our support team</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-orange-500 text-white'
                      : currentStep === step.id
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs opacity-75">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className={`w-4 h-4 ${currentStep > step.id ? 'text-orange-500' : 'text-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Category & Priority */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What type of issue are you experiencing?</h3>
                <p className="text-gray-600">Select the category that best describes your request</p>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Category</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card
                        key={category.value}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          formData.category === category.value
                            ? `${category.bgColor} ${category.borderColor} border-2 ring-2 ring-opacity-50`
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleInputChange('category', category.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{category.label}</h4>
                              <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Priority Level</Label>
                <div className="space-y-2">
                  {priorities.map((priority) => {
                    const Icon = priority.icon;
                    return (
                      <Card
                        key={priority.value}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          formData.priority === priority.value
                            ? 'bg-orange-50 border-orange-200 border-2 ring-2 ring-orange-200 ring-opacity-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleInputChange('priority', priority.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <Icon className={`w-5 h-5 ${formData.priority === priority.value ? 'text-orange-600' : 'text-gray-500'}`} />
                              <div>
                                <h4 className="font-medium text-gray-900">{priority.label}</h4>
                                <p className="text-sm text-gray-600">{priority.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {priority.responseTime}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell us more about your issue</h3>
                <p className="text-gray-600">Provide detailed information to help us resolve your request faster</p>
              </div>

              {/* Selected Category & Priority Summary */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">{selectedCategory?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityIcon className="w-5 h-5 text-orange-600" />
                      <Badge className={selectedPriority?.color}>
                        {selectedPriority?.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Ticket Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief, descriptive title for your issue"
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500">Keep it concise but descriptive (e.g., "Login page not loading")</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  rows={6}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                  required
                />
                
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Preferred Resolution Date (Optional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">When would you ideally like this resolved?</p>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Ticket</h3>
                <p className="text-gray-600">Please review the details before submitting</p>
              </div>

              {/* Ticket Summary */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Ticket className="w-5 h-5" />
                    Ticket Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Category</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryIcon className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">{selectedCategory?.label}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Priority</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <PriorityIcon className="w-4 h-4 text-orange-600" />
                        <Badge className={selectedPriority?.color}>
                          {selectedPriority?.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Response Time</Label>
                      <p className="font-medium mt-1">{selectedPriority?.responseTime}</p>
                    </div>
                    {formData.dueDate && (
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Preferred Date</Label>
                        <p className="font-medium mt-1">{new Date(formData.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Title</Label>
                    <p className="font-medium mt-1">{formData.title}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                    <div className="mt-1 p-3 bg-white/50 rounded-md text-sm max-h-32 overflow-y-auto">
                      {formData.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

             
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {isSubmitting ? (
                    <ButtonLoader size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
  );
}
