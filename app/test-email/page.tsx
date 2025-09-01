"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendWelcomeEmail } from "@/lib/emailService";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "",
    department: "Engineering",
    position: "Software Developer"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);

    try {
      const result = await sendWelcomeEmail({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        loginEmail: formData.email,
        portalUrl: 'https://portal.mizetechnologies.com/'
      });

      if (result) {
        toast.success("✅ Test email sent successfully! Check your inbox and console logs.");
      } else {
        toast.error("❌ Failed to send test email. Check console logs for details.");
      }
    } catch (error) {
      console.error("❌ Test email error:", error);
      toast.error("❌ Error sending test email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <CardTitle className="text-2xl font-bold">📧 Test Welcome Email</CardTitle>
            <p className="text-white/90">Test the Email.js integration for welcome emails</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="border-cyan-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="border-cyan-200 focus:border-cyan-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter test email address"
                  className="border-cyan-200 focus:border-cyan-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="border-cyan-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="border-cyan-200 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {loading ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">🔍 Debug Info</h3>
              <p className="text-sm text-gray-600 mb-1">
                Check the browser console for detailed logs about the email sending process.
              </p>
              <p className="text-sm text-gray-600">
                Make sure your Email.js configuration is correct in <code>lib/emailService.ts</code>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
