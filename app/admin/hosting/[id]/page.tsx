import HostingForm from "@/components/hosting/HostingForm";

interface Props {
  params: {
    id: string;
  };
}

export default function EditHostingPage({ params }: Props) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Hosting</h1>
      </div>
      <HostingForm hostingId={params.id} />
    </div>
  );
} 