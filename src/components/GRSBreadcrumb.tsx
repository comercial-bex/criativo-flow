import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";
import { useGRSContext } from "@/hooks/useGRSContext";

export function GRSBreadcrumb() {
  const { breadcrumb } = useGRSContext();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        {breadcrumb.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {index === breadcrumb.length - 1 ? (
                <BreadcrumbPage className="font-medium">
                  {item}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={index === 0 ? '/grs' : '#'}>
                  {item}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumb.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}