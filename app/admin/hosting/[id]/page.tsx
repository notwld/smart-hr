import { use } from "react";
import HostingForm from "@/components/hosting/HostingForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditHostingPage({ params }: Props) {
  // Unwrap params with React.use()
  const resolvedParams = use(params);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Hosting</h1>
      </div>
      <HostingForm hostingId={resolvedParams.id} />
    </div>
  );
} 