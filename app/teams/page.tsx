"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Plus, Search, Filter, MoreHorizontal, Users, UserPlus, Trash2, Edit } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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
  _count?: {
    members: number;
  };
};

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<UserData[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    leaderId: "",
    memberIds: [] as string[],
  });
  
  const router = useRouter();
  const { toast } = useToast();

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/teams");
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teams. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/teams/employees");
      console.log("Employees API response:", typeof response.data, Array.isArray(response.data) ? 'is array' : 'not array', response.data);
      
      if (!response.data) {
        setAvailableEmployees([]);
        return;
      }
      
      if (!Array.isArray(response.data)) {
        console.error("API response is not an array:", response.data);
        setAvailableEmployees([]);
        return;
      }
      
      setAvailableEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAvailableEmployees([]);
    }
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeam.name || !newTeam.leaderId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Team name and leader are required.",
        });
        return;
      }

      const response = await axios.post("/api/teams", newTeam);
      setTeams([response.data, ...teams]);
      setIsCreateModalOpen(false);
      setNewTeam({
        name: "",
        description: "",
        leaderId: "",
        memberIds: [],
      });
      
      toast({
        title: "Success",
        description: "Team created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create team. Please try again.",
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    
    try {
      await axios.delete(`/api/teams/${teamId}`);
      setTeams(teams.filter((team) => team.id !== teamId));
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete team. Please try again.",
      });
    }
  };

  const handleMemberCheckboxChange = (userId: string) => {
    const updatedMemberIds = newTeam.memberIds.includes(userId)
      ? newTeam.memberIds.filter((id) => id !== userId)
      : [...newTeam.memberIds, userId];
    
    setNewTeam({ ...newTeam, memberIds: updatedMemberIds });
  };

  const filterManagersOrLeaders = () => {
    if (!Array.isArray(availableEmployees)) {
      console.error("availableEmployees is not an array:", availableEmployees);
      return [];
    }
    
    // Return all employees without filtering by position
    return availableEmployees;
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${team.leader.firstName} ${team.leader.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 w-full">
     
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search teams..."
                  className="pl-9 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>Add a new team to your organization</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Team Name</Label>
                      <Input
                        id="name"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Enter team name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newTeam.description}
                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                        placeholder="Enter team description"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="leader">Team Leader</Label>
                      <Select
                        value={newTeam.leaderId}
                        onValueChange={(value) => setNewTeam({ ...newTeam, leaderId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterManagersOrLeaders().map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Team Members</Label>
                      <ScrollArea className="h-[200px] border rounded-md p-2">
                        <div className="space-y-2 pr-3">
                          {availableEmployees
                            .filter(emp => emp.id !== newTeam.leaderId)
                            .map((employee) => (
                              <div key={employee.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`employee-${employee.id}`}
                                  checked={newTeam.memberIds.includes(employee.id)}
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
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTeam}>Create Team</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Teams Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading teams...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "Create a team to get started"}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium">{team.name}</CardTitle>
                        <CardDescription className="text-sm truncate max-w-[200px]">
                          {team.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}`)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Team
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTeam(team.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {team.leader.firstName} {team.leader.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Team Leader • {team.leader.position}</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm text-gray-500 mb-2">Team Members ({(() => {
                          // Count unique members including leader
                          const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                          return uniqueMemberIds.size;
                        })()})</p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.slice(0, 3).map((member) => (
                            <div 
                              key={member.id} 
                              className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium"
                              title={`${member.user.firstName} ${member.user.lastName}`}
                            >
                              {member.user.firstName[0]}{member.user.lastName[0]}
                            </div>
                          ))}
                          
                          {(() => {
                            const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                            const totalMembers = uniqueMemberIds.size;
                            return totalMembers > 3 ? (
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                                +{totalMembers - 3}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full text-primary hover:text-primary/90 border-primary"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 