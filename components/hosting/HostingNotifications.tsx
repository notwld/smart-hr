"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Server, X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Hosting {
  id: string;
  clientName: string;
  domain: string;
  expiryDate: string;
  cost: number;
}

interface HostingNotification {
  expired: Hosting[];
  expiring: Hosting[];
  totalExpired: number;
  totalExpiring: number;
}

export default function HostingNotifications() {
  const [notifications, setNotifications] = useState<HostingNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/hosting/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching hosting notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading || !notifications || dismissed) return null;

  const hasNotifications = notifications.totalExpired > 0 || notifications.totalExpiring > 0;

  if (!hasNotifications) return null;

  return (
    <div className="mb-6">
      {notifications.totalExpired > 0 && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="flex items-center justify-between">
            <div>
              <AlertTitle className="text-red-800">
                {notifications.totalExpired} Hosting{notifications.totalExpired > 1 ? 's' : ''} Expired
              </AlertTitle>
              <AlertDescription className="text-red-700">
                These hostings have already expired and need immediate attention.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {notifications.totalExpiring > 0 && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <div className="flex items-center justify-between">
            <div>
              <AlertTitle className="text-yellow-800">
                {notifications.totalExpiring} Hosting{notifications.totalExpiring > 1 ? 's' : ''} Expiring Soon
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                These hostings will expire within the next 7 days.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Hosting Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
           

            {notifications.expiring.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Expiring Soon</h4>
                <div className="space-y-2">
                  {notifications.expiring.slice(0, 5).map((hosting) => (
                    <div key={hosting.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div>
                        <div className="font-medium text-sm">{hosting.domain}</div>
                        <div className="text-xs text-gray-600">{hosting.clientName}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                          Expires {format(new Date(hosting.expiryDate), "MMM dd")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {notifications.expiring.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      And {notifications.expiring.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link href="/admin/hosting">
              <Button variant="outline" className="w-full">
                View All Hostings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
