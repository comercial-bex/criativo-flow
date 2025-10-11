import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartForm } from "@/components/SmartForm";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Pencil, 
  Trash2, 
  Lock,
  ShieldAlert
} from "lucide-react";
import { smartToast } from "@/lib/smart-toast";
import { format } from "date-fns";

interface CofreCredenciaisProps {
  clienteId: string;
  projetoId?: string;
  readOnly?: boolean;
}

interface Credencial {
  id: string;
  categoria: string;
  plataforma: string;
  usuario_login: string;
  extra: any;
  updated_at: string;
  updated_by_nome?: string;
}

const CATEGORIAS = [
  { value: 'social', label: 'Redes Sociais', icon: '👥' },
  { value: 'ads', label: 'Anúncios', icon: '📢' },
  { value: 'email_workspace', label: 'E-mail / Workspace', icon: '📧' },
  { value: 'dominio_dns', label: 'Domínio / DNS', icon: '🌐' },
  { value: 'hosting_cdn', label: 'Hosting / CDN', icon: '☁️' },
  { value: 'site_cms', label: 'Site / CMS', icon: '🖥️' },
  { value: 'analytics', label: 'Analytics', icon: '📊' },
  { value: 'tagmanager', label: 'Tag Manager', icon: '🏷️' },
  { value: 'mensageria', label: 'Mensageria', icon: '💬' },
  { value: 'outros', label: 'Outros', icon: '🔧' },
];

// Presets de campos por plataforma
const PLATFORM_PRESETS: Record<string, {
  fields: string[];
  placeholders: Record<string, string>;
}> = {
  'Instagram': {
    fields: ['handle', 'url_perfil', 'backup_2fa'],
    placeholders: {
      handle: '@empresa',
      url_perfil: 'instagram.com/empresa',
      backup_2fa: 'Códigos de backup ou e-mail de recuperação'
    }
  },
  'Meta Ads': {
    fields: ['account_id', 'bm_id', 'pixel_id'],
    placeholders: {
      account_id: 'ID da Conta de Anúncios',
      bm_id: 'ID do Business Manager',
      pixel_id: 'Pixel(s) instalado(s)'
    }
  },
  'Google Ads': {
    fields: ['customer_id', 'conversion_id'],
    placeholders: {
      customer_id: 'CID (Customer ID)',
      conversion_id: 'ID de conversão'
    }
  },
  'GA4': {
    fields: ['measurement_id', 'property_id'],
    placeholders: {
      measurement_id: 'G-XXXXXXXXXX',
      property_id: 'ID da propriedade'
    }
  },
};

export function CofreCredenciais({ clienteId, projetoId, readOnly = false }: CofreCredenciaisProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [selectedCred, setSelectedCred] = useState<Credencial | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealReason, setRevealReason] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'social',
    plataforma: '',
    usuario_login: '',
    senha: '',
    secrets: '',  // Tokens/API keys (criptografados separadamente)
    notas: '',
    // Campos dinâmicos da plataforma
    extra: {} as Record<string, string>,
  });

  const queryClient = useQueryClient();

  // Buscar metadados
  const { data: credenciais, isLoading } = useQuery({
    queryKey: ['credenciais', clienteId, projetoId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_cred_get_metadata', {
        p_cliente_id: clienteId,
        p_projeto_id: projetoId || null,
      });
      if (error) throw error;
      return data as Credencial[];
    },
  });

  // Salvar/Atualizar credencial
  const saveMutation = useMutation({
    mutationFn: async (values: typeof formData) => {
      // Preparar secrets_json (tokens/API keys)
      let secretsJson = {};
      if (values.secrets && values.secrets.trim()) {
        try {
          secretsJson = JSON.parse(values.secrets);
        } catch {
          secretsJson = { raw_text: values.secrets }; // Se não for JSON válido, salvar como texto
        }
      }

      const { data, error } = await supabase.rpc('fn_cred_save', {
        p_cliente_id: clienteId,
        p_projeto_id: projetoId || null,
        p_categoria: values.categoria,
        p_plataforma: values.plataforma,
        p_usuario_login: values.usuario_login,
        p_senha_plain: values.senha,
        p_extra_json: { notas: values.notas, ...values.extra },
        p_secrets_json: secretsJson,
        p_cred_id: selectedCred?.id || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credenciais'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      setEditModalOpen(false);
      resetForm();
    },
  });

  // Revelar senha
  const [revealedSecrets, setRevealedSecrets] = useState<any>(null);
  const revealMutation = useMutation({
    mutationFn: async ({ credId, motivo }: { credId: string; motivo: string }) => {
      const { data, error } = await supabase.rpc('fn_cred_reveal', {
        p_cred_id: credId,
        p_motivo: motivo,
      });
      if (error) throw error;
      return data[0]; // Retorna { senha_plain, secrets_plain }
    },
    onSuccess: (result) => {
      setRevealedPassword(result.senha_plain);
      setRevealedSecrets(result.secrets_plain);
      setPasswordVisible(true);
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      // Auto-hide após 30s
      setTimeout(() => {
        setPasswordVisible(false);
        setRevealedPassword(null);
        setRevealedSecrets(null);
      }, 30000);
    },
  });

  const handleRevealPassword = async () => {
    if (!selectedCred || !revealReason.trim()) {
      smartToast.error('Erro', 'Informe o motivo do acesso');
      return;
    }
    await revealMutation.mutateAsync({
      credId: selectedCred.id,
      motivo: revealReason,
    });
    setRevealModalOpen(false);
    setRevealReason("");
  };

  const copyToClipboard = (text: string, tipo: string) => {
    navigator.clipboard.writeText(text);
    smartToast.success('Copiado!', `${tipo} copiado para área de transferência`);

    // Auto-limpar clipboard após 20s
    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 20000);
  };

  const resetForm = () => {
    setFormData({
      categoria: 'social',
      plataforma: '',
      usuario_login: '',
      senha: '',
      secrets: '',
      notas: '',
      extra: {},
    });
    setSelectedCred(null);
  };

  const handleEdit = (cred: Credencial) => {
    setSelectedCred(cred);
    setFormData({
      categoria: cred.categoria,
      plataforma: cred.plataforma,
      usuario_login: cred.usuario_login,
      senha: '', // Não pré-preencher senha
      secrets: '',
      notas: cred.extra?.notas || '',
      extra: cred.extra || {},
    });
    setEditModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Cofre de Credenciais</CardTitle>
                <CardDescription>
                  Armazenamento seguro de logins e senhas com criptografia
                </CardDescription>
              </div>
            </div>
            {!readOnly && (
              <Button onClick={() => setEditModalOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Credencial
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : !credenciais || credenciais.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma credencial cadastrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credenciais.map((cred) => (
                  <TableRow key={cred.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIAS.find(c => c.value === cred.categoria)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{cred.plataforma}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{cred.usuario_login}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cred.usuario_login, 'Login')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(cred.updated_at), 'dd/MM/yyyy HH:mm')}
                      {cred.updated_by_nome && (
                        <span className="block text-xs">por {cred.updated_by_nome}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!readOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCred(cred);
                              setRevealModalOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Revelar Senha
                          </Button>
                        )}
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cred)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição/Criação */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCred ? 'Editar Credencial' : 'Nova Credencial'}
            </DialogTitle>
            <DialogDescription>
              Todos os dados são criptografados antes de serem salvos
            </DialogDescription>
          </DialogHeader>
          
          <SmartForm
            onSubmit={async () => {
              await saveMutation.mutateAsync(formData);
            }}
            successMessage={selectedCred ? "Credencial atualizada" : "Credencial criada"}
            onSuccess={() => setEditModalOpen(false)}
          >
            <div className="space-y-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plataforma</Label>
                <Input
                  value={formData.plataforma}
                  onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
                  placeholder="Ex: Instagram, Gmail, Google Ads..."
                  required
                />
              </div>

              <div>
                <Label>Login / Usuário</Label>
                <Input
                  value={formData.usuario_login}
                  onChange={(e) => setFormData({ ...formData, usuario_login: e.target.value })}
                  placeholder="Email, usuário ou ID"
                  required
                />
              </div>

              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder={selectedCred ? "Deixe vazio para manter a atual" : "Digite a senha"}
                  required={!selectedCred}
                />
              </div>

              <div>
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditModalOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Credencial
              </Button>
            </DialogFooter>
          </SmartForm>
        </DialogContent>
      </Dialog>

      {/* Modal de Revelar Senha */}
      <Dialog open={revealModalOpen} onOpenChange={setRevealModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-warning">
              <ShieldAlert className="h-5 w-5" />
              <DialogTitle>Revelar Senha</DialogTitle>
            </div>
            <DialogDescription>
              Esta ação será registrada nos logs de auditoria
            </DialogDescription>
          </DialogHeader>

          {!revealedPassword ? (
            <div className="space-y-4">
              <div>
                <Label>Motivo do acesso</Label>
                <Textarea
                  value={revealReason}
                  onChange={(e) => setRevealReason(e.target.value)}
                  placeholder="Ex: Configuração de campanha, Atualização de perfil..."
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setRevealModalOpen(false);
                  setRevealReason("");
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleRevealPassword}>
                  Confirmar e Revelar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Senha</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 bg-background rounded border font-mono text-sm">
                    {passwordVisible ? revealedPassword : '••••••••••••'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(revealedPassword!, 'Senha')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Senha será ocultada automaticamente em 30s e clipboard será limpo em 20s
                </p>
              </div>

              <Badge variant="outline" className="w-full justify-center py-2">
                Acesso registrado nos logs de auditoria
              </Badge>

              <DialogFooter>
                <Button onClick={() => {
                  setRevealModalOpen(false);
                  setRevealedPassword(null);
                  setPasswordVisible(false);
                  setSelectedCred(null);
                }}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
