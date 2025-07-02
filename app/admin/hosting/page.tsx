import HostingList from "@/components/hosting/HostingList";

export default function HostingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Hosting Management</h1>
      </div>
      <HostingList />
    </div>
  );
} 