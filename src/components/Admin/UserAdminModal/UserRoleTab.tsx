import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Palette, Video, Target, BarChart3, DollarSign, Phone, UserCog } from 'lucide-react';
import { useClientesAtivos } from '@/hooks/useClientesOptimized';

interface UserRoleTabProps {
  selectedTipo: 'admin' | 'cliente' | 'especialista';
  setSelectedTipo: (tipo: 'admin' | 'cliente' | 'especialista') => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedClienteId: string | null;
  setSelectedClienteId: (id: string | null) => void;
  selectedPapeis: string[];
  setSelectedPapeis: (papeis: string[]) => void;
}

export function UserRoleTab({
  selectedTipo,
  setSelectedTipo,
  selectedRole,
  setSelectedRole,
  selectedClienteId,
  setSelectedClienteId,
  selectedPapeis,
  setSelectedPapeis,
}: UserRoleTabProps) {
  // ✅ Hook otimizado para clientes
  const { data: clientes = [] } = useClientesAtivos();

  const handleTipoChange = (tipo: 'admin' | 'cliente' | 'especialista') => {
    setSelectedTipo(tipo);
    
    // Resetar role baseado no tipo
    if (tipo === 'admin') {
      setSelectedRole('admin');
      setSelectedClienteId(null);
      setSelectedPapeis([]);
    } else if (tipo === 'cliente') {
      setSelectedRole('cliente');
      setSelectedPapeis(['cliente']);
    } else {
      setSelectedRole('grs');
      setSelectedClienteId(null);
      setSelectedPapeis(['colaborador']);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Usuário</CardTitle>
          <CardDescription>
            Selecione o tipo principal de acesso do usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedTipo} onValueChange={handleTipoChange as any}>
            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="admin" id="admin" />
              <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer flex-1">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="cliente" id="cliente" />
              <Label htmlFor="cliente" className="flex items-center gap-2 cursor-pointer flex-1">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">Acesso restrito ao seu cliente</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="especialista" id="especialista" />
              <Label htmlFor="especialista" className="flex items-center gap-2 cursor-pointer flex-1">
                <Palette className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Especialista</p>
                  <p className="text-sm text-muted-foreground">Profissional interno da equipe</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedTipo === 'cliente' && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente Vinculado</Label>
              <Select value={selectedClienteId || ''} onValueChange={setSelectedClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome_fantasia || cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTipo === 'especialista' && (
        <Card>
          <CardHeader>
            <CardTitle>Função do Especialista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Departamento/Função</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grs">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      GRS - Gestão de Resultados e Sucesso
                    </div>
                  </SelectItem>
                  <SelectItem value="designer">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Designer
                    </div>
                  </SelectItem>
                  <SelectItem value="filmmaker">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Filmmaker
                    </div>
                  </SelectItem>
                  <SelectItem value="gestor">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Gestor
                    </div>
                  </SelectItem>
                  <SelectItem value="financeiro">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financeiro
                    </div>
                  </SelectItem>
                  <SelectItem value="atendimento">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Atendimento
                    </div>
                  </SelectItem>
                  <SelectItem value="rh">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      RH
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
