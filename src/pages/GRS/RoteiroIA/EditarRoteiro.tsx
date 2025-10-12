import { useParams } from "react-router-dom";
import { useRoteiros } from "@/hooks/useRoteiros";
import RoteiroWizard from "@/components/RoteiroIA/RoteiroWizard";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarRoteiroPage() {
  const { id } = useParams();
  const { roteiros, isLoading } = useRoteiros();
  
  const roteiro = roteiros?.find((r: any) => r.id === id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return <RoteiroWizard mode="edit" roteiroId={id} initialData={roteiro} />;
}
