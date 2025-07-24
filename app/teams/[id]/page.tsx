"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Edit, Trash2, ChevronLeft, PlusCircle, UserMinus, UserPlus, ArrowLeft } from "lucide-react";
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

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<UserData[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  
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
      await axios.post(`/api/teams/${params.id}/members`, {
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
      await axios.delete(`/api/teams/${params.id}/members?userId=${userId}`);
      
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
    <div className="flex h-screen bg-gray-50 w-full">
   
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/teams')}
                className="mr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-sm text-gray-500">
                  {team.description || "No description provided"}
                </p>
              </div>
              <div className="ml-auto space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/teams/${team.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Team
                </Button>
                <Dialog open={isAddMembersModalOpen} onOpenChange={setIsAddMembersModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add Team Members</DialogTitle>
                      <DialogDescription>
                        Select employees to add to the team {team.name}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Label className="mb-2 block">Available Employees</Label>
                      <ScrollArea className="h-[300px] border rounded-md p-2">
                        <div className="space-y-2 pr-3">
                          {getNonMemberEmployees().length === 0 ? (
                            <p className="text-center py-4 text-gray-500">No available employees to add</p>
                          ) : (
                            getNonMemberEmployees().map((employee) => (
                              <div key={employee.id} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`employee-${employee.id}`}
                                  checked={selectedMembers.includes(employee.id)}
                                  onCheckedChange={() => handleMemberCheckboxChange(employee.id)}
                                />
                                <Label 
                                  htmlFor={`employee-${employee.id}`} 
                                  className="flex items-center justify-between w-full cursor-pointer"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {employee.firstName} {employee.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {employee.position}
                                    </span>
                                  </div>
                                  <Badge variant="outline">{employee.department}</Badge>
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMembersModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddMembers}
                        disabled={selectedMembers.length === 0}
                      >
                        Add {selectedMembers.length} Members
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Team Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Team Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Team Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Team Leader */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Team Leader</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{team.leader.firstName} {team.leader.lastName}</p>
                          <p className="text-sm text-gray-500">{team.leader.position}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Team Details */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Department</label>
                      <p>{team.leader.department}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Created On</label>
                      <p>{format(new Date(team.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Team Size</label>
                      <p>{(() => {
                        // Count unique members including leader
                        const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                        return uniqueMemberIds.size;
                      })()} Members (including leader)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Team Members</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-primary"
                      onClick={() => setIsAddMembersModalOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Members
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Team Leader (at the top) */}
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium">{team.leader.firstName} {team.leader.lastName}</p>
                          <Badge className="ml-2 bg-blue-500">Leader</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{team.leader.position} • {team.leader.department}</p>
                      </div>
                      <Badge variant="outline" className="text-gray-500">
                        {team.leader.email}
                      </Badge>
                    </div>
                    
                    {/* Team Members (excluding leader to avoid duplication) */}
                    {team.members.filter((member) => member.user.id !== team.leaderId).length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>No additional team members yet</p>
                        <Button 
                          variant="link" 
                          onClick={() => setIsAddMembersModalOpen(true)}
                          className="mt-2"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Members
                        </Button>
                      </div>
                    ) : (
                      team.members
                        .filter((member) => member.user.id !== team.leaderId)
                        .map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 border-b pb-3 last:border-b-0">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                            <p className="text-sm text-gray-500">
                              {member.user.position} • {member.user.department} • 
                              <span className="ml-1">Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}</span>
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-gray-500">
                              {member.user.email}
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => setUserToRemove(member.user.id)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.user.firstName} {member.user.lastName} from the team?
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
                                    {isRemovingMember ? "Removing..." : "Remove"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 