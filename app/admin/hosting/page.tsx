import HostingList from "@/components/hosting/HostingList";
import HostingNotifications from "@/components/hosting/HostingNotifications";

export default function HostingPage() {
  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Hosting Management</h1>
      </div>
      <HostingList />
    </div>
  );
} 