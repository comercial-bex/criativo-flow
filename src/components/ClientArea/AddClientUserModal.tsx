import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AddClientUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  onSuccess: (userData: {
    email: string;
    password: string;
    nome: string;
    role_cliente: string;
  }) => void;
}

interface FormData {
  email: string;
  password: string;
  nome: string;
  role_cliente: string;
}

export function AddClientUserModal({
  open,
  onOpenChange,
  clienteId,
  onSuccess,
}: AddClientUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    nome: "",
    role_cliente: "proprietario",
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "proprietario", label: "Proprietário" },
    { value: "gerente_financeiro", label: "Gerente Financeiro" },
    { value: "gestor_marketing", label: "Gestor de Marketing" },
    { value: "social_media", label: "Social Media" },
  ];

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.nome) {
      return;
    }

    setLoading(true);

    try {
      onSuccess(formData);
      onOpenChange(false);
      setFormData({
        email: "",
        password: "",
        nome: "",
        role_cliente: "proprietario",
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário para acessar a área do cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="João Silva"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="usuario@empresa.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha Temporária</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Senha temporária"
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                disabled={loading}
              >
                Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <Select
              value={formData.role_cliente}
              onValueChange={(value) =>
                setFormData({ ...formData, role_cliente: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
