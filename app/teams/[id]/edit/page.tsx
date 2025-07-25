"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, ChevronLeft, Save } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/sidebar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

type TeamData = {
  id: string;
  name: string;
  description: string | null;
  leaderId: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
  };
  members: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      position: string;
    };
  }[];
};

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
};

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    leaderId: "",
    memberIds: [] as string[],
  });
  const [availableEmployees, setAvailableEmployees] = useState<UserData[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();

  // Fetch team data on component mount
  useEffect(() => {
    fetchTeam();
    fetchAvailableEmployees();
  }, [params.id]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/teams/${params.id}`);
      const teamData = response.data;
      setTeam(teamData);
      setTeamForm({
        name: teamData.name,
        description: teamData.description || "",
        leaderId: teamData.leaderId,
        memberIds: teamData.members?.map((member: any) => member.user.id) || [],
      });
    } catch (error: any) {
      console.error("Error fetching team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load team details.",
      });
      if (error.response?.status === 404) {
        router.push('/teams');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const response = await axios.get("/api/teams/employees");
      const responseData = response.data || [];
      if (!Array.isArray(responseData)) {
        setAvailableEmployees([]);
        return;
      }
      setAvailableEmployees(responseData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAvailableEmployees([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberCheckboxChange = (userId: string) => {
    const updatedMemberIds = teamForm.memberIds.includes(userId)
      ? teamForm.memberIds.filter((id) => id !== userId)
      : [...teamForm.memberIds, userId];
    
    setTeamForm({ ...teamForm, memberIds: updatedMemberIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamForm.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Team name is required.",
      });
      return;
    }

    setSaving(true);
    try {
      await axios.put(`/api/teams/${params.id}`, teamForm);
      toast({
        title: "Success",
        description: "Team updated successfully.",
      });
      router.push(`/teams/${params.id}`);
    } catch (error: any) {
      console.error("Error updating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update team.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-screen bg-gray-50 w-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Team not found</h2>
            <Button 
              variant="link" 
              onClick={() => router.push('/teams')}
              className="mt-4"
            >
              Back to Teams
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 w-full">
     
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/teams/${params.id}`)}
                className="mr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Team</h1>
                <p className="text-sm text-gray-500">
                  Make changes to team {team.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={teamForm.name}
                      onChange={handleInputChange}
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={teamForm.description}
                      onChange={handleInputChange}
                      placeholder="Enter team description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leaderId">Team Leader</Label>
                    <Select
                      value={teamForm.leaderId}
                      onValueChange={(value) => setTeamForm({ ...teamForm, leaderId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} - {employee.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Changing the team leader will update reporting relationships for all team members.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="space-y-2 pr-3">
                        {availableEmployees
                          .filter(emp => emp.id !== teamForm.leaderId)
                          .map((employee) => (
                            <div key={employee.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`employee-${employee.id}`}
                                checked={teamForm.memberIds.includes(employee.id)}
                                onCheckedChange={() => handleMemberCheckboxChange(employee.id)}
                              />
                              <Label htmlFor={`employee-${employee.id}`} className="flex items-center justify-between w-full">
                                <span>
                                  {employee.firstName} {employee.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {employee.position}
                                </span>
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-gray-500 mt-1">
                      Select team members. The team leader is automatically included.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/teams/${params.id}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 