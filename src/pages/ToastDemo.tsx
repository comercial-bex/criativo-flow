import { useState } from "react";
import { useBexToast } from "@/components/BexToast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Rocket,
  Heart,
  Star,
  Zap,
  Upload,
  Download,
  Save,
  Trash2
} from "lucide-react";
import { StaggerChildren, StaggerItem } from "@/components/transitions";

export default function ToastDemoPage() {
  const { showToast, setPosition, position } = useBexToast();
  const [customTitle, setCustomTitle] = useState("Notificação Customizada");
  const [customDescription, setCustomDescription] = useState("Esta é uma mensagem personalizada");
  const [customDuration, setCustomDuration] = useState("5000");

  const demos = [
    {
      category: "Variantes Básicas",
      items: [
        {
          label: "Success",
          onClick: () => showToast({
            title: "Operação bem-sucedida!",
            description: "Seus dados foram salvos com sucesso no sistema",
            variant: "success"
          })
        },
        {
          label: "Error",
          onClick: () => showToast({
            title: "Erro ao processar",
            description: "Não foi possível completar a operação. Tente novamente.",
            variant: "error"
          })
        },
        {
          label: "Warning",
          onClick: () => showToast({
            title: "Atenção necessária",
            description: "Verifique os dados antes de continuar com esta ação",
            variant: "warning"
          })
        },
        {
          label: "Info",
          onClick: () => showToast({
            title: "Nova atualização disponível",
            description: "Uma nova versão do sistema está disponível para instalação",
            variant: "info"
          })
        },
        {
          label: "Default",
          onClick: () => showToast({
            title: "Notificação do sistema",
            description: "Esta é uma mensagem informativa geral"
          })
        }
      ]
    },
    {
      category: "Ícones Customizados",
      items: [
        {
          label: "Rocket",
          onClick: () => showToast({
            title: "Lançamento realizado!",
            description: "Nova funcionalidade publicada com sucesso",
            variant: "success",
            icon: Rocket
          })
        },
        {
          label: "Heart",
          onClick: () => showToast({
            title: "Obrigado pelo feedback!",
            description: "Sua avaliação é muito importante para nós",
            variant: "info",
            icon: Heart
          })
        },
        {
          label: "Star",
          onClick: () => showToast({
            title: "Parabéns!",
            description: "Você conquistou uma nova conquista",
            variant: "success",
            icon: Star
          })
        },
        {
          label: "Zap",
          onClick: () => showToast({
            title: "Ação rápida!",
            description: "Processamento em alta velocidade",
            variant: "warning",
            icon: Zap
          })
        }
      ]
    },
    {
      category: "Com Ações",
      items: [
        {
          label: "Com Botão",
          onClick: () => showToast({
            title: "Relatório gerado",
            description: "Seu relatório está pronto para download",
            variant: "success",
            icon: Download,
            action: {
              label: "Baixar",
              onClick: () => alert("Download iniciado!")
            }
          })
        },
        {
          label: "Confirmação",
          onClick: () => showToast({
            title: "Item excluído",
            description: "O item foi removido permanentemente",
            variant: "error",
            icon: Trash2,
            action: {
              label: "Desfazer",
              onClick: () => showToast({
                title: "Ação desfeita!",
                variant: "success"
              })
            }
          })
        },
        {
          label: "Upload",
          onClick: () => showToast({
            title: "Arquivo enviado",
            description: "Upload concluído com sucesso",
            variant: "success",
            icon: Upload,
            action: {
              label: "Ver Arquivo",
              onClick: () => alert("Abrindo arquivo...")
            }
          })
        }
      ]
    },
    {
      category: "Durações Diferentes",
      items: [
        {
          label: "Rápido (2s)",
          onClick: () => showToast({
            title: "Copiado!",
            variant: "success",
            duration: 2000
          })
        },
        {
          label: "Normal (5s)",
          onClick: () => showToast({
            title: "Notificação padrão",
            description: "Duração de 5 segundos",
            variant: "info",
            duration: 5000
          })
        },
        {
          label: "Longo (10s)",
          onClick: () => showToast({
            title: "Mensagem importante",
            description: "Esta mensagem fica visível por mais tempo para leitura completa",
            variant: "warning",
            duration: 10000
          })
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bex-500 to-bex-600 bg-clip-text text-transparent">
            Sistema de Toasts BEX
          </h1>
          <p className="text-muted-foreground">
            Sistema de notificações personalizado com design BEX, animações e posições configuráveis
          </p>
        </div>

        {/* Position Selector */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="position">Posição dos Toasts</Label>
              <Select value={position} onValueChange={(value: any) => setPosition(value)}>
                <SelectTrigger id="position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Superior Direita</SelectItem>
                  <SelectItem value="top-left">Superior Esquerda</SelectItem>
                  <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                  <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                  <SelectItem value="top-center">Superior Centro</SelectItem>
                  <SelectItem value="bottom-center">Inferior Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Custom Toast Creator */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Criar Toast Customizado</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Digite o título"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Digite a descrição"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (ms)</Label>
              <Input
                id="duration"
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => showToast({
                  title: customTitle,
                  description: customDescription,
                  variant: "success",
                  duration: parseInt(customDuration)
                })}
              >
                Testar Toast
              </Button>
            </div>
          </div>
        </Card>

        {/* Demo Buttons */}
        <StaggerChildren>
          {demos.map((section) => (
            <StaggerItem key={section.category}>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.items.map((item) => (
                    <Button
                      key={item.label}
                      onClick={item.onClick}
                      variant="outline"
                      className="hover:bg-bex/10 hover:text-bex hover:border-bex transition-all"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Multiple Toasts Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Teste de Múltiplos Toasts</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                showToast({ title: "Toast 1", variant: "success" });
                setTimeout(() => showToast({ title: "Toast 2", variant: "info" }), 500);
                setTimeout(() => showToast({ title: "Toast 3", variant: "warning" }), 1000);
              }}
              variant="outline"
            >
              Mostrar 3 Toasts
            </Button>
            <Button
              onClick={() => {
                for (let i = 1; i <= 5; i++) {
                  setTimeout(() => {
                    showToast({
                      title: `Notificação ${i}`,
                      description: `Esta é a notificação número ${i}`,
                      variant: ["success", "error", "warning", "info", "default"][i % 5] as any
                    });
                  }, i * 300);
                }
              }}
              variant="outline"
            >
              Mostrar 5 Toasts
            </Button>
          </div>
        </Card>

        {/* Guide Link */}
        <Card className="p-6 bg-bex/5 border-bex/20">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 mx-auto text-bex" />
            <h3 className="text-lg font-semibold">Guia Completo de Uso</h3>
            <p className="text-sm text-muted-foreground">
              Veja o arquivo <code className="px-2 py-1 bg-bex/10 rounded">TOAST_BEX_GUIA_USO.md</code> para documentação completa
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
