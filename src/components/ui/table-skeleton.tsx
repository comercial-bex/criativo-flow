import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { BexSkeleton } from "./bex-skeleton";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ 
  columns, 
  rows = 5,
  showHeader = true 
}: TableSkeletonProps) {
  return (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <BexSkeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <BexSkeleton 
                  className="h-4" 
                  style={{ 
                    width: `${60 + Math.random() * 40}%`,
                    animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`
                  }} 
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
