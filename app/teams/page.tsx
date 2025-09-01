"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Plus, Search, Filter, MoreHorizontal, Users, UserPlus, Trash2, Edit, Badge } from "lucide-react";
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="w-full text-center mb-8">
          <Card className="w-full border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
            <CardHeader className="w-full text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl w-full font-bold flex gap-2">
                    <Users className="w-8 h-8" />
                    Teams Management
                  </CardTitle>
                  <p className="text-left text-white/90 mt-1">Manage and organize your teams</p>
                </div>
                <div className="flex">
                  <PermissionGuard permissions="teams.create">
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="text-black bg-white px-8 py-3 text-lg hover:bg-gray-100">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Team
                        </Button>
                          </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg -m-6 mb-6">
                          <DialogTitle className="text-xl flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Create New Team
                          </DialogTitle>
                          <DialogDescription className="text-white/90">
                            Add a new team to your organization
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                Team Name
                              </Label>
                              <Input
                                id="name"
                                value={newTeam.name}
                                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                placeholder="Enter team name"
                                className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>

                            <div>
                              <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Edit className="w-4 h-4 text-green-600" />
                                Description
                              </Label>
                              <Input
                                id="description"
                                value={newTeam.description}
                                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                placeholder="Enter team description"
                                className="h-11 border-2 border-gray-200 focus:border-green-500 transition-colors"
                              />
                            </div>

                            <div>
                              <Label htmlFor="leader" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                Team Leader
                              </Label>
                              <Select
                                value={newTeam.leaderId}
                                onValueChange={(value) => setNewTeam({ ...newTeam, leaderId: value })}
                              >
                                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-colors">
                                  <SelectValue placeholder="Select a team leader" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filterManagersOrLeaders().map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                      <div className="flex items-center gap-2">
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
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-orange-600" />
                                Team Members
                              </Label>
                              <ScrollArea className="h-[250px] border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="space-y-3 pr-3">
                                  {availableEmployees
                                    .filter(emp => emp.id !== newTeam.leaderId)
                                    .map((employee) => (
                                      <div key={employee.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                        <Checkbox
                                          id={`employee-${employee.id}`}
                                          checked={newTeam.memberIds.includes(employee.id)}
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
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateModalOpen(false)}
                              className="h-11 px-8 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateTeam}
                              className="h-11 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Team
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </PermissionGuard>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Stats */}
        <div className="w-full mb-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="search"
                    placeholder="Search teams by name, description, or leader..."
                    className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="w-full">
          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <Card className="border-0 shadow-lg bg-white p-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">Loading teams...</p>
                    <p className="text-sm text-gray-500">Please wait while we fetch your team data</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="w-full">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "No teams found" : "No teams created yet"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? "Try a different search term or clear your search" : "Get started by creating your first team to organize your employees"}
                  </p>
                  <div className="flex justify-center gap-3">
                    {searchTerm && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                        className="px-6 py-2"
                      >
                        Clear Search
                      </Button>
                    )}
                    <PermissionGuard permissions="teams.create">
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Team
                      </Button>
                    </PermissionGuard>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group hover:scale-[1.02]">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {team.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {team.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="font-semibold">Team Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push(`/teams/${team.id}`)}
                            className="cursor-pointer"
                          >
                            <Users className="mr-2 h-4 w-4 text-blue-600" />
                            View Team Details
                          </DropdownMenuItem>
                          <PermissionGuard permissions="teams.edit">
                            <DropdownMenuItem
                              onClick={() => router.push(`/teams/${team.id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-green-600" />
                              Edit Team
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permissions="teams.delete">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTeam(team.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Team
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Team Leader */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {team.leader.firstName[0]}{team.leader.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-blue-900 truncate">
                              {team.leader.firstName} {team.leader.lastName}
                            </p>
                            <p className="text-xs text-blue-700 truncate">
                              Team Leader • {team.leader.position}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-green-800">Team Members</p>
                         
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 4).map((member) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-white"
                                title={`${member.user.firstName} ${member.user.lastName}`}
                              >
                                {member.user.firstName[0]}{member.user.lastName[0]}
                              </div>
                            ))}
                            {(() => {
                              const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                              const totalMembers = uniqueMemberIds.size;
                              return totalMembers > 4 ? (
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                                  +{totalMembers - 4}
                                </div>
                              ) : null;
                            })()}
                          </div>
                          {(() => {
                            const uniqueMemberIds = new Set([team.leaderId, ...team.members.map(m => m.user.id)]);
                            const totalMembers = uniqueMemberIds.size;
                            return totalMembers > 1 ? (
                              <span className="text-xs text-green-600 ml-2">
                                +{totalMembers - 1} member{totalMembers - 1 !== 1 ? 's' : ''}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200 group-hover:shadow-lg"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Team Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 