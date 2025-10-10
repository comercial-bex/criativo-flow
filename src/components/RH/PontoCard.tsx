import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Colaborador } from '@/hooks/useColaboradores';
import { useFolhaPonto } from '@/hooks/useFolhaPonto';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  Clock,
  Moon,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PontoCardProps {
  ponto: any;
  colaborador?: Colaborador;
  onApprove: () => void;
  onReject: () => void;
}

export function PontoCard({ ponto, colaborador, onApprove, onReject }: PontoCardProps) {
  const { salvar } = useFolhaPonto(undefined, ponto.competencia);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    horas_trabalhadas: ponto.horas_trabalhadas || 0,
    horas_he_50: ponto.horas_he_50 || 0,
    horas_he_100: ponto.horas_he_100 || 0,
    horas_noturno: ponto.horas_noturno || 0,
    horas_falta: ponto.horas_falta || 0,
    minutos_atraso: ponto.minutos_atraso || 0,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pendente: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
      aprovado: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
      rejeitado: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
    };
    const config = variants[status] || variants.pendente;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Validação CLT: HE não pode ultrapassar 2h/dia
  const validateCLT = () => {
    const totalHE = editData.horas_he_50 + editData.horas_he_100;
    if (colaborador?.regime === 'clt' && totalHE > 2) {
      return {
        valid: false,
        message: 'CLT: HE não pode ultrapassar 2h/dia (Lei 13.467/2017)',
      };
    }
    return { valid: true };
  };

  const handleSaveEdit = () => {
    const validation = validateCLT();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    salvar({
      id: ponto.id,
      colaborador_id: ponto.colaborador_id,
      competencia: ponto.competencia,
      ...editData,
    });
    setEditOpen(false);
    toast.success('Registro de ponto atualizado!');
  };

  const totalExtras =
    (ponto.valor_he_50 || 0) +
    (ponto.valor_he_100 || 0) +
    (ponto.valor_adicional_noturno || 0);

  const totalDescontos =
    (ponto.valor_desconto_falta || 0) + (ponto.valor_desconto_atraso || 0);

  const totalLiquido = totalExtras - totalDescontos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {colaborador?.nome_completo || 'Colaborador não encontrado'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {colaborador?.cargo_atual || '-'} • {colaborador?.regime?.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(ponto.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Horas Trabalhadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Horas Base</p>
              <p className="text-lg font-bold text-foreground">
                {ponto.horas_trabalhadas || 0}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> HE 50%
              </p>
              <p className="text-lg font-bold text-primary">
                {ponto.horas_he_50 || 0}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> HE 100%
              </p>
              <p className="text-lg font-bold text-primary">
                {ponto.horas_he_100 || 0}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Moon className="h-3 w-3" /> Noturno
              </p>
              <p className="text-lg font-bold text-warning">
                {ponto.horas_noturno || 0}h
              </p>
            </div>
          </div>

          <Separator />

          {/* Valores Calculados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">HE 50%</p>
              <p className="text-sm font-semibold text-success">
                + {formatCurrency(ponto.valor_he_50 || 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">HE 100%</p>
              <p className="text-sm font-semibold text-success">
                + {formatCurrency(ponto.valor_he_100 || 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Noturno</p>
              <p className="text-sm font-semibold text-success">
                + {formatCurrency(ponto.valor_adicional_noturno || 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Faltas/Atrasos</p>
              <p className="text-sm font-semibold text-destructive">
                - {formatCurrency(totalDescontos)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Total e Ações */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Líquido</p>
              <p className={`text-2xl font-bold ${totalLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalLiquido >= 0 ? '+' : ''}{formatCurrency(totalLiquido)}
              </p>
            </div>

            <div className="flex gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Registro de Ponto</DialogTitle>
                    <DialogDescription>
                      {colaborador?.nome_completo} • {colaborador?.regime?.toUpperCase()}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="horas_trabalhadas">Horas Trabalhadas</Label>
                      <Input
                        id="horas_trabalhadas"
                        type="number"
                        step="0.01"
                        value={editData.horas_trabalhadas}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            horas_trabalhadas: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horas_he_50">HE 50%</Label>
                      <Input
                        id="horas_he_50"
                        type="number"
                        step="0.01"
                        value={editData.horas_he_50}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            horas_he_50: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horas_he_100">HE 100%</Label>
                      <Input
                        id="horas_he_100"
                        type="number"
                        step="0.01"
                        value={editData.horas_he_100}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            horas_he_100: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horas_noturno">Horas Noturno</Label>
                      <Input
                        id="horas_noturno"
                        type="number"
                        step="0.01"
                        value={editData.horas_noturno}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            horas_noturno: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horas_falta">Horas Falta</Label>
                      <Input
                        id="horas_falta"
                        type="number"
                        step="0.01"
                        value={editData.horas_falta}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            horas_falta: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minutos_atraso">Minutos de Atraso</Label>
                      <Input
                        id="minutos_atraso"
                        type="number"
                        value={editData.minutos_atraso}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            minutos_atraso: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  {colaborador?.regime === 'clt' && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-warning">Atenção: Regime CLT</p>
                        <p className="text-muted-foreground">
                          Hora Extra não pode ultrapassar 2h/dia (Lei 13.467/2017)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {ponto.status === 'pendente' && (
                <>
                  <Button
                    size="sm"
                    className="bg-success hover:bg-success/90"
                    onClick={onApprove}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={onReject}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejeitar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
