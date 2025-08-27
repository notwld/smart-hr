"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, User, Users, Phone, Mail, MapPin, Calendar, DollarSign, FileText, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
}

interface LeadFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export function LeadForm({ initialData, onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    platform: "",
    service: "",
    firstCall: "",
    comments: "",
    address: "",
    credits: 0,
    cost: 0,
    status: "new",
    date: new Date(),
    time: "",
    assigneeId: "unassigned",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        number: initialData.number || "",
        platform: initialData.platform || "",
        service: initialData.service || "",
        firstCall: initialData.firstCall || "",
        comments: initialData.comments || "",
        address: initialData.address || "",
        credits: initialData.credits || 0,
        cost: initialData.cost || 0,
        status: initialData.status || "new",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        time: initialData.time || "",
        assigneeId: initialData.assigneeId || initialData.assignee?.id || "unassigned",
      });
    }
  }, [initialData]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        credits: parseInt(formData.credits.toString()),
        cost: parseFloat(formData.cost.toString()),
        assigneeId: formData.assigneeId === "unassigned" ? null : formData.assigneeId,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const platforms = [
    "Facebook",
    "Instagram", 
    "LinkedIn",
    "Twitter",
    "Google Ads",
    "Website",
    "Referral",
    "Cold Call",
    "Email",
    "Other"
  ];

  const services = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Digital Marketing",
    "SEO",
    "Content Writing",
    "Graphic Design",
    "E-commerce",
    "Consulting",
    "Other"
  ];

  const statuses = [
    "new",
    "contacted",
    "qualified",
    "proposal_sent",
    "negotiation",
    "converted",
    "lost",
    "follow_up"
  ];

  const firstCallOptions = [
    "Interested",
    "Not Interested",
    "Call Back Later",
    "Wrong Number",
    "No Answer",
    "Voicemail"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="border-2 border-blue-200 focus:border-blue-500 transition-colors"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="border-2 border-blue-200 focus:border-blue-500 transition-colors"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                required
                className="border-2 border-blue-200 focus:border-blue-500 transition-colors"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full address..."
                className="border-2 border-blue-200 focus:border-blue-500 transition-colors"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div>
              <Label htmlFor="platform" className="text-sm font-medium text-purple-700">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => handleInputChange("platform", value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 transition-colors">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service" className="text-sm font-medium text-purple-700">Service *</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => handleInputChange("service", value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 transition-colors">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="firstCall" className="text-sm font-medium text-purple-700">First Call Response *</Label>
              <Select
                value={formData.firstCall}
                onValueChange={(value) => handleInputChange("firstCall", value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 transition-colors">
                  <SelectValue placeholder="Select response" />
                </SelectTrigger>
                <SelectContent>
                  {firstCallOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-purple-700">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div>
              <Label className="text-sm font-medium text-green-700 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Date *
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-2 border-green-200 hover:border-green-500 transition-colors",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      handleInputChange("date", date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-green-700">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
                className="border-2 border-green-200 focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <Label htmlFor="assigneeId">Assign To</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => handleInputChange("assigneeId", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {employees.length > 0 && employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                          <div className="text-xs text-gray-500">{employee.position}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Notes */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div>
              <Label htmlFor="cost" className="text-sm font-medium text-orange-700 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Expected Cost ($) *
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                required
                className="border-2 border-orange-200 focus:border-orange-500 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="credits" className="text-sm font-medium text-orange-700">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => handleInputChange("credits", parseInt(e.target.value) || 0)}
                className="border-2 border-orange-200 focus:border-orange-500 transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="comments" className="text-sm font-medium text-orange-700 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Comments
              </Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                placeholder="Additional notes about this lead..."
                rows={4}
                className="border-2 border-orange-200 focus:border-orange-500 transition-colors"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            initialData ? "Update Lead" : "Create Lead"
          )}
        </Button>
      </div>
    </form>
  );
}
