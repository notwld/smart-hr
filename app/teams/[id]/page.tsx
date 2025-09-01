"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { User, Edit, Trash2, ChevronLeft, PlusCircle, UserMinus, UserPlus, ArrowLeft, Users } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TeamData = {
  id: string;
  name: string;
  description: string | null;
  leaderId: string;
  createdAt: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    role: string;
    image: string | null;
  };
  members: {
    id: string;
    joinedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      position: string;
      department: string;
      role: string;
      image: string | null;
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
  role: string;
};

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<UserData[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

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
      setTeam(response.data);
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
      setAvailableEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAvailableEmployees([]);
    }
  };

  const handleMemberCheckboxChange = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one member to add.",
      });
      return;
    }

    try {
      await axios.post(`/api/teams/${resolvedParams.id}/members`, {
        memberIds: selectedMembers
      });

      toast({
        title: "Success",
        description: "Team members added successfully.",
      });

      setIsAddMembersModalOpen(false);
      setSelectedMembers([]);
      fetchTeam();
    } catch (error: any) {
      console.error("Error adding team members:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add team members.",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setIsRemovingMember(true);
    try {
      await axios.delete(`/api/teams/${resolvedParams.id}/members?userId=${userId}`);

      toast({
        title: "Success",
        description: "Team member removed successfully.",
      });

      fetchTeam();
    } catch (error: any) {
      console.error("Error removing team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to remove team member.",
      });
    } finally {
      setIsRemovingMember(false);
      setUserToRemove(null);
    }
  };

  const getNonMemberEmployees = () => {
    if (!team) return [];
    
    const memberIds = team.members.map(member => member.user.id);
    // Also exclude the team leader
    memberIds.push(team.leaderId);
    
    return availableEmployees.filter(employee => !memberIds.includes(employee.id));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="w-full mb-8">
          <Card className="w-full border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
            <CardHeader className="w-full text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/teams')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-3xl w-full font-bold flex gap-2 truncate">
                      <Users className="w-8 h-8 shrink-0" />
                      {team.name}
                    </CardTitle>
                    <p className="text-left text-white/90 mt-1 truncate">
                      {team.description || "No description provided"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teams/${team.id}/edit`)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Team
                  </Button>
                  <Dialog open={isAddMembersModalOpen} onOpenChange={setIsAddMembersModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-black bg-white px-6 py-2 text-lg hover:bg-gray-100">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg -m-6 mb-6">
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Add Team Members
                        </DialogTitle>
                        <DialogDescription className="text-white/90">
                          Select employees to add to the team {team.name}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <Label className="mb-4 block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Available Employees ({getNonMemberEmployees().length})
                        </Label>
                        <ScrollArea className="h-[350px] border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="space-y-3 pr-3">
                            {getNonMemberEmployees().length === 0 ? (
                              <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-gray-600 font-medium">No available employees</p>
                                <p className="text-sm text-gray-500 mt-1">All employees are already team members</p>
                              </div>
                            ) : (
                              getNonMemberEmployees().map((employee) => (
                                <div key={employee.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                  <Checkbox
                                    id={`employee-${employee.id}`}
                                    checked={selectedMembers.includes(employee.id)}
                                    onCheckedChange={() => handleMemberCheckboxChange(employee.id)}
                                    className="border-2"
                                  />
                                  <Label
                                    htmlFor={`employee-${employee.id}`}
                                    className="flex items-center justify-between w-full cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                        {employee.firstName[0]}{employee.lastName[0]}
                                      </div>
                                      <div>
                                        <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                                        <div className="text-xs text-gray-500">{employee.position}</div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {employee.department}
                                    </Badge>
                                  </Label>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      <DialogFooter className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddMembersModalOpen(false)}
                          className="h-11 px-8 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddMembers}
                          disabled={selectedMembers.length === 0}
                          className="h-11 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add {selectedMembers.length} Members
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Team Content */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Team Info */}
            <Card className="lg:col-span-1 border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Users className="w-5 h-5" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Team Leader */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-3 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Team Leader
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {team.leader.firstName[0]}{team.leader.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-900 truncate">{team.leader.firstName} {team.leader.lastName}</p>
                        <p className="text-sm text-blue-700 truncate">{team.leader.position}</p>
                        <p className="text-xs text-blue-600 truncate">{team.leader.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Team Details */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <label className="text-xs font-semibold text-green-700 uppercase tracking-wide block mb-2">Department</label>
                      <p className="text-green-900 font-medium">{team.leader.department}</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide block mb-2">Created On</label>
                      <p className="text-purple-900 font-medium">{format(new Date(team.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide block mb-2">Team Size</label>
                      <div className="flex items-center gap-2">
                        <p className="text-orange-900 font-medium">
                          {(() => {
                            const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                            return uniqueMemberIds.size;
                          })()} Members
                        </p>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                          Including Leader
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="lg:col-span-3 border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                    <Users className="w-6 h-6" />
                    Team Members
                    
                  </CardTitle>
                  
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Team Leader (at the top) */}
                  

                  {/* Team Members (excluding leader to avoid duplication) */}
                  {team.members.filter((member) => member.user.id !== team.leaderId).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Additional Members</h3>
                      <p className="text-gray-500 mb-6">This team only has a leader. Add more members to collaborate effectively.</p>
                      <Button
                        onClick={() => setIsAddMembersModalOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
                      >
                        <PlusCircle className="h-5 h-5 mr-2" />
                        Add First Member
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {team.members
                        .filter((member) => member.user.id !== team.leaderId)
                        .map((member) => (
                        <div key={member.id} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {member.user.firstName[0]}{member.user.lastName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{member.user.firstName} {member.user.lastName}</p>
                                <p className="text-gray-600 text-sm truncate">
                                  {member.user.position} • {member.user.department}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-gray-500 text-xs">{member.user.email}</p>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-green-600 text-xs font-medium">
                                    Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active Member
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setUserToRemove(member.user.id)}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <UserMinus className="w-5 h-5 text-red-600" />
                                      Remove Team Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove <strong>{member.user.firstName} {member.user.lastName}</strong> from the team?
                                      This will also remove their reporting relationship with the team leader.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.user.id)}
                                      disabled={isRemovingMember}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {isRemovingMember ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                          Removing...
                                        </>
                                      ) : (
                                        <>
                                          <UserMinus className="w-4 h-4 mr-2" />
                                          Remove Member
                                        </>
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 