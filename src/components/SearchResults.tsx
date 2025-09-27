import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/hooks/useUniversalSearch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  FolderOpen, 
  FileText, 
  Camera, 
  Calendar,
  UserCheck
} from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onResultClick?: () => void;
}

const categoryIcons = {
  clientes: Users,
  projetos: FolderOpen,
  posts: FileText,
  equipamentos: Camera,
  captacoes: Calendar,
  especialistas: UserCheck
};

const categoryLabels = {
  clientes: 'Cliente',
  projetos: 'Projeto',
  posts: 'Planejamento',
  equipamentos: 'Equipamento',
  captacoes: 'Captação',
  especialistas: 'Especialista'
};

const categoryColors = {
  clientes: 'bg-blue-100 text-blue-800',
  projetos: 'bg-green-100 text-green-800',
  posts: 'bg-purple-100 text-purple-800',
  equipamentos: 'bg-orange-100 text-orange-800',
  captacoes: 'bg-yellow-100 text-yellow-800',
  especialistas: 'bg-pink-100 text-pink-800'
};

export function SearchResults({ results, isLoading, query, onResultClick }: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    onResultClick?.();
  };

  if (isLoading) {
    return (
      <Card className="fixed top-16 left-0 right-0 mt-1 z-60 mx-4">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!query.trim()) return null;

  if (results.length === 0) {
    return (
      <Card className="fixed top-16 left-0 right-0 mt-1 z-60 mx-4">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Nenhum resultado encontrado para "{query}"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed top-16 left-0 right-0 mt-1 z-60 mx-4 max-h-96 overflow-y-auto">
      <CardContent className="p-2">
        {results.map((result) => {
          const Icon = categoryIcons[result.category];
          return (
            <div
              key={result.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              onClick={() => handleResultClick(result)}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium truncate">{result.title}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${categoryColors[result.category]}`}
                  >
                    {categoryLabels[result.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {result.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}