"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { User, ChevronLeft, Save, UserPlus, Edit, Users } from "lucide-react";
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
import PermissionGuard from "@/components/PermissionGuard";

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

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Unwrap params with React.use()
  const resolvedParams = use(params);

  // Fetch team data on component mount
  useEffect(() => {
    fetchTeam();
    fetchAvailableEmployees();
  }, [resolvedParams.id]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/teams/${resolvedParams.id}`);
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
      await axios.put(`/api/teams/${resolvedParams.id}`, teamForm);
      toast({
        title: "Success",
        description: "Team updated successfully.",
      });
      router.push(`/teams/${resolvedParams.id}`);
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
    <PermissionGuard
      permissions="teams.edit"
      fallback={
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <Card className="border-0 shadow-lg bg-white p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">You don't have permission to edit teams.</p>
            <Button
              onClick={() => router.push('/teams')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </Card>
        </div>
      }
    >
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="w-full container mx-auto py-8 px-4">
          {/* Header */}
          <div className="w-full mb-8">
            <Card className="w-full border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
              <CardHeader className="w-full text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/teams/${resolvedParams.id}`)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <div>
                      <CardTitle className="text-3xl w-full font-bold flex gap-2">
                        <Edit className="w-8 h-8" />
                        Edit Team
                      </CardTitle>
                      <p className="text-left text-white/90 mt-1">Make changes to team {team.name}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Form */}
          <div className="w-full">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                  <Users className="w-6 h-6" />
                  Team Information
                </CardTitle>
                <p className="text-blue-600 text-sm">Update team details and membership</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Team Name Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Team Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={teamForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter team name"
                        required
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-green-600" />
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={teamForm.description}
                        onChange={handleInputChange}
                        placeholder="Enter team description"
                        rows={4}
                        className="border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Team Leader Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Team Leadership
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="leaderId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Team Leader
                      </Label>
                      <Select
                        value={teamForm.leaderId}
                        onValueChange={(value) => setTeamForm({ ...teamForm, leaderId: value })}
                      >
                        <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Select a team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
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
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700">
                          <strong>Note:</strong> Changing the team leader will update reporting relationships for all team members.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-orange-600" />
                      Team Members
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-orange-600" />
                        Select Team Members
                      </Label>
                      <ScrollArea className="h-[300px] border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="space-y-3 pr-3">
                          {availableEmployees
                            .filter(emp => emp.id !== teamForm.leaderId)
                            .map((employee) => (
                              <div key={employee.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                <Checkbox
                                  id={`employee-${employee.id}`}
                                  checked={teamForm.memberIds.includes(employee.id)}
                                  onCheckedChange={() => handleMemberCheckboxChange(employee.id)}
                                  className="border-2"
                                />
                                <Label htmlFor={`employee-${employee.id}`} className="flex items-center justify-between w-full cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                      {employee.firstName[0]}{employee.lastName[0]}
                                    </div>
                                    <div>
                                      <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                                      <div className="text-xs text-gray-500">{employee.position}</div>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-orange-700">
                          <strong>Note:</strong> Select team members from the list above. The team leader is automatically included.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/teams/${resolvedParams.id}`)}
                      className="h-11 px-8 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-11 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
} 