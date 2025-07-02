import HostingForm from "@/components/hosting/HostingForm";

export default function NewHostingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Create New Hosting</h1>
      </div>
      <HostingForm />
    </div>
  );
} 