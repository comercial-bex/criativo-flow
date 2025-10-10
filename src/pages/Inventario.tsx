import { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InventarioModal } from '@/components/Inventario/InventarioModal';
import { useInventarioItens, useInventarioCategorias } from '@/hooks/useInventario';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
  const { startTutorial, hasSeenTutorial } = useTutorial('inventario');

  const { data: itens, isLoading: loadingItens } = useInventarioItens();
  const { data: categorias, isLoading: loadingCategorias } = useInventarioCategorias();

  const filteredItens = itens?.filter(item => {
    const itemNome = item.modelo?.modelo || '';
    const matchesSearch = itemNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === 'all' || item.modelo?.categoria?.id === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const handleNewItem = () => {
    setSelectedItemId(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleViewItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setModalMode('edit');
    setModalOpen(true);
  };

  const getStatusBadge = (condicao: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      excelente: { variant: 'default', label: 'Excelente' },
      bom: { variant: 'secondary', label: 'Bom' },
      regular: { variant: 'outline', label: 'Regular' },
      ruim: { variant: 'destructive', label: 'Ruim' },
    };
    const config = variants[condicao] || variants.bom;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventário de Equipamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie equipamentos, patrimônio e reservas
          </p>
        </div>
        <Button onClick={handleNewItem} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      {loadingItens || loadingCategorias ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando inventário...</p>
        </div>
      ) : filteredItens && filteredItens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItens.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewItem(item.id)}
            >
              <CardHeader>
              <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.modelo?.modelo || 'Sem modelo'}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.numero_serie && <span className="font-mono text-xs">#{item.numero_serie}</span>}
                    </CardDescription>
                  </div>
                  {getStatusBadge(item.condicao)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">
                      {item.modelo?.categoria?.nome || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marca:</span>
                    <span className="font-medium">{item.modelo?.marca || 'N/A'}</span>
                  </div>
                  {item.valor_aquisicao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(item.valor_aquisicao))}
                      </span>
                    </div>
                  )}
                  {item.localizacao_atual && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localização:</span>
                      <span className="font-medium truncate ml-2">{item.localizacao_atual}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditItem(item.id);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategoria !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Comece adicionando seu primeiro item ao inventário'}
              </p>
              {!searchTerm && selectedCategoria === 'all' && (
                <Button onClick={handleNewItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <InventarioModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        itemId={selectedItemId}
        mode={modalMode}
        onSave={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}
