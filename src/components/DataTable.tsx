import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  actions?: {
    label: string;
    onClick: (row: any) => void;
    variant?: 'default' | 'outline' | 'destructive';
  }[];
}

export function DataTable({ 
  title,
  columns,
  data,
  searchable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  className = '',
  emptyMessage = 'Nenhum item encontrado',
  actions = []
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile-small' || deviceType === 'mobile';

  const filteredData = searchTerm
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Mobile Card View
  if (isMobile) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className={`${deviceType === 'mobile-small' ? 'pb-2' : 'pb-3'}`}>
            <CardTitle className={`${deviceType === 'mobile-small' ? 'text-lg' : 'text-xl'}`}>
              {title}
            </CardTitle>
          </CardHeader>
        )}
        
        <CardContent className={`space-y-4 ${deviceType === 'mobile-small' ? 'p-3' : 'p-4'}`}>
          {/* Mobile Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3">
            {paginatedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              paginatedData.map((row, index) => (
                <Card key={index} className={`${deviceType === 'mobile-small' ? 'p-3' : 'p-4'} space-y-2 border`}>
                  {columns.map((column) => (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className={`${deviceType === 'mobile-small' ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground min-w-0 flex-1`}>
                        {column.label}:
                      </span>
                      <div className={`${deviceType === 'mobile-small' ? 'text-xs' : 'text-sm'} text-right ml-2 flex-1`}>
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key] || '-'
                        }
                      </div>
                    </div>
                  ))}
                  {actions.length > 0 && (
                    <div className="flex gap-2 pt-2 border-t">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || "outline"}
                          size={deviceType === 'mobile-small' ? "sm" : "default"}
                          onClick={() => action.onClick(row)}
                          className="flex-1"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Mobile Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className={`${deviceType === 'mobile-small' ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Ant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próx
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Desktop/Tablet Table View
  return (
    <Card className={className}>
      {(title || searchable || filterable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            <div className="flex items-center space-x-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${deviceType === 'tablet' ? 'w-48' : 'w-64'}`}
                  />
                </div>
              )}
              {filterable && (
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`text-left font-medium ${
                    deviceType === 'tablet' ? 'p-3 text-xs' : 'p-4 text-sm'
                  }`}>
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className={`text-right font-medium ${
                    deviceType === 'tablet' ? 'p-3 text-xs' : 'p-4 text-sm'
                  }`}>
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                    className="text-center p-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className={`${
                        deviceType === 'tablet' ? 'p-3 text-sm' : 'p-4'
                      }`}>
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className={`text-right ${
                        deviceType === 'tablet' ? 'p-3' : 'p-4'
                      }`}>
                        <div className="flex items-center justify-end space-x-2">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'outline'}
                              size={deviceType === 'tablet' ? 'sm' : 'sm'}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && totalPages > 1 && (
          <div className={`flex items-center justify-between border-t ${
            deviceType === 'tablet' ? 'p-3' : 'p-4'
          }`}>
            <div className={`${deviceType === 'tablet' ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} itens
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className={`${deviceType === 'tablet' ? 'text-xs' : 'text-sm'}`}>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}