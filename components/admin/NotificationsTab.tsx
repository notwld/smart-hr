"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { safeFormatDate } from "@/lib/utils";
import {
  Bell,
  Send,
  Users,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Check,
  X,
  UserCheck,
  UserX,
  EyeOff,
  Filter
} from "lucide-react";
import { Loader, ButtonLoader } from "@/components/ui/loader";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "SENT";
  createdAt: string;
  sentAt?: string;
  recipientCount?: number;
  recipients?: NotificationRecipient[];
}

interface NotificationRecipient {
  id: string;
  userId: string;
  status: "SENT" | "READ" | "PENDING";
  readAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    position?: string;
  };
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH"
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotification),
      });

      if (!response.ok) throw new Error("Failed to create notification");

      const result = await response.json();
      toast.success(`Notification sent to ${result.recipientCount} employees`);
      
      setShowCreateDialog(false);
      setNewNotification({ title: "", message: "", priority: "MEDIUM" });
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      toast.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    return safeFormatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAcknowledgmentStats = (notification: Notification) => {
    const recipients = notification.recipients ?? [];
    if (recipients.length === 0) return { read: 0, unread: 0, total: 0 };

    const read = recipients.filter(r => r.status === "READ").length;
    const unread = recipients.filter(r => r.status === "SENT").length;
    const total = recipients.length;

    return { read, unread, total };
  };

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailsDialog(true);
  };

  const getAcknowledgmentStatus = (status: string) => {
    switch (status) {
      case 'READ':
        return { icon: Check, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Read' };
      case 'SENT':
        return { icon: EyeOff, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Unread' };
      case 'PENDING':
        return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Pending' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Bell className="w-6 h-6 mr-2" />
                Notification Management
              </CardTitle>
              <p className="text-white/90 mt-1">Send announcements and notifications to all employees</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(notifications ?? []).filter(n => n.status === "SENT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(notifications ?? []).filter(n => n.status === "DRAFT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(notifications ?? []).filter(n => n.priority === "HIGH").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    let totalRead = 0;
                    (notifications ?? []).forEach(n => {
                      const recipients = n.recipients ?? [];
                      totalRead += recipients.filter(r => r.status === "READ").length;
                    });
                    return totalRead;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <EyeOff className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    let totalUnread = 0;
                    (notifications ?? []).forEach(n => {
                      const recipients = n.recipients ?? [];
                      totalUnread += recipients.filter(r => r.status === "SENT").length;
                    });
                    return totalUnread;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Bell className="w-5 h-5 mr-2" />
            Recent Notifications
            <Badge className="ml-3 bg-indigo-50 text-indigo-700 border-indigo-200">
              {(notifications ?? []).length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Title</TableHead>
                  <TableHead className="font-semibold text-gray-700">Message</TableHead>
                  <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Recipients</TableHead>
                  <TableHead className="font-semibold text-gray-700">Acknowledgment</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(notifications ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Bell className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No notifications found</p>
                        <p className="text-gray-400 text-sm">Create your first notification to get started</p>
                        <Button
                          onClick={() => setShowCreateDialog(true)}
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Notification
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (notifications ?? []).map((notification, index) => {
                    const stats = getAcknowledgmentStats(notification);
                    const readPercentage = stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0;

                    return (
                      <TableRow key={notification.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <TableCell className="py-4 font-medium text-gray-900 max-w-xs">
                          <p className="truncate" title={notification.title ?? ""}>{notification.title ?? "—"}</p>
                        </TableCell>
                        <TableCell className="py-4 max-w-sm">
                          <p className="text-sm text-gray-700 truncate" title={notification.message}>
                            {notification.message}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`font-medium ${getStatusColor(notification.status ?? "")}`}>
                            {notification.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="font-medium">{notification.recipientCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">{stats.read}</span>
                              <span className="text-gray-500">read</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <EyeOff className="w-4 h-4 text-orange-600" />
                              <span className="text-orange-700 font-medium">{stats.unread}</span>
                              <span className="text-gray-500">unread</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                                  style={{ width: `${readPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{readPercentage}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-600">
                          {notification.status === 'SENT' && notification.sentAt
                            ? formatDate(notification.sentAt)
                            : formatDate(notification.createdAt)
                          }
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewNotificationDetails(notification)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200"
                              title="View acknowledgment details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Create New Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Notification Title
              </label>
              <Input
                placeholder="Enter notification title..."
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Message
              </label>
              <Textarea
                placeholder="Enter your message here..."
                rows={4}
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Priority Level
              </label>
              <select
                value={newNotification.priority}
                onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" }))}
                className="w-full rounded-md border border-indigo-200 focus:border-indigo-500 bg-white px-3 py-2 text-sm"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Notification Preview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This notification will be sent to all active employees in the system. 
                    Make sure your message is clear and professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={createNotification}
              disabled={sending || !newNotification.title.trim() || !newNotification.message.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            >
              {sending ? (
                <ButtonLoader size="sm" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to All Employees
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Acknowledgments
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6">
            

             

              {/* Recipient List */}
              <Card className="border-0 shadow-sm">
               
                <CardContent className="pt-5">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {(selectedNotification.recipients ?? []).map((recipient) => {
                        const statusInfo = getAcknowledgmentStatus(recipient.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <div
                            key={recipient.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                                <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {recipient.user?.firstName ?? ""} {recipient.user?.lastName ?? ""}
                                </p>
                                <p className="text-sm text-gray-500">{recipient.user?.email ?? "—"}</p>
                                {recipient.user?.department && (
                                  <p className="text-xs text-gray-400">{recipient.user.department}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                                {statusInfo.label}
                              </Badge>
                              {recipient.readAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Read: {formatDate(recipient.readAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
                {selectedNotification.status === 'SENT' && (
                  <Button
                    onClick={() => {
                      // Could add follow-up notification functionality here
                      toast.info("Follow-up notification feature coming soon!");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Follow-up
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
