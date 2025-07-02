"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronsUpDown, CalendarIcon, DollarSign, Server, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface HostingFormProps {
  hostingId?: string;
}

export default function HostingForm({ hostingId }: HostingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    domain: "",
    cost: "",
    startDate: new Date(),
    expiryDate: new Date(),
    durationType: "",
    notes: "",
  });

  // Fetch clients for dropdown
  const fetchClients = async (search: string = "") => {
    try {
      const response = await fetch(`/api/clients?search=${search}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // Fetch hosting data for editing
  const fetchHosting = async () => {
    if (!hostingId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/hosting/${hostingId}`);
      if (!response.ok) throw new Error("Failed to fetch hosting");
      
      const data = await response.json();
      const hosting = data.hosting;

      setFormData({
        clientId: hosting.clientId,
        domain: hosting.domain,
        cost: hosting.cost.toString(),
        startDate: new Date(hosting.startDate),
        expiryDate: new Date(hosting.expiryDate),
        durationType: hosting.durationType,
        notes: hosting.notes || "",
      });

      setSelectedClient(hosting.client);
    } catch (error) {
      toast.error("Failed to fetch hosting details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    if (hostingId) {
      fetchHosting();
    }
  }, [hostingId]);

  // Auto-calculate expiry date based on duration type
  useEffect(() => {
    if (formData.durationType && formData.startDate) {
      const startDate = new Date(formData.startDate);
      let expiryDate = new Date(startDate);

      if (formData.durationType === "MONTHLY") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (formData.durationType === "YEARLY") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      if (formData.durationType !== "CUSTOM") {
        setFormData(prev => ({ ...prev, expiryDate }));
      }
    }
  }, [formData.durationType, formData.startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.domain || !formData.cost || !formData.durationType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const url = hostingId ? `/api/hosting/${hostingId}` : "/api/hosting";
      const method = hostingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          domain: formData.domain,
          cost: parseFloat(formData.cost),
          startDate: formData.startDate.toISOString(),
          expiryDate: formData.expiryDate.toISOString(),
          durationType: formData.durationType,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save hosting");
      }

      toast.success(hostingId ? "Hosting updated successfully" : "Hosting created successfully");
      router.push("/admin/hosting");
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && hostingId) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {hostingId ? "Edit Hosting" : "Create New Hosting"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {selectedClient ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedClient.firstName} {selectedClient.lastName}
                      </div>
                    ) : (
                      "Select client..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search clients..." 
                      onValueChange={(search) => fetchClients(search)}
                    />
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => {
                            setSelectedClient(client);
                            setFormData(prev => ({ ...prev, clientId: client.id }));
                            setClientOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.firstName} {client.lastName}</span>
                            <span className="text-sm text-gray-500">{client.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <div className="relative">
                <Server className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {/* Duration Type */}
            <div className="space-y-2">
              <Label htmlFor="durationType">Duration Type *</Label>
              <Select
                value={formData.durationType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, durationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, startDate: date }));
                        setStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? format(formData.expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, expiryDate: date }));
                        setExpiryDateOpen(false);
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < formData.startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the hosting..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : hostingId ? "Update Hosting" : "Create Hosting"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/hosting")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 