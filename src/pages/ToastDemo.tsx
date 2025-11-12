import { useState } from "react";
import { useBexToast, toast } from "@/components/BexToast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  Trash2,
  Volume2,
  VolumeX
} from "lucide-react";
import { StaggerChildren, StaggerItem } from "@/components/transitions";

export default function ToastDemoPage() {
  const { 
    setPosition, 
    position, 
    success, 
    error, 
    warning, 
    info, 
    loading, 
    update, 
    dismiss, 
    promise,
    maxVisible,
    setMaxVisible,
    queuedCount,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    testSound
  } = useBexToast();
  const [customTitle, setCustomTitle] = useState("Notificação Customizada");
  const [customDescription, setCustomDescription] = useState("Esta é uma mensagem personalizada");
  const [customDuration, setCustomDuration] = useState("5000");
  const [customMaxVisible, setCustomMaxVisible] = useState(String(maxVisible));

  const demos = [
    {
      category: "Teste de Sons",
      items: [
        {
          label: "Som Success",
          onClick: () => {
            testSound("success");
            toast.success("Som de sucesso!", "Duas notas ascendentes");
          }
        },
        {
          label: "Som Error",
          onClick: () => {
            testSound("error");
            toast.error("Som de erro!", "Tom descendente dramático");
          }
        },
        {
          label: "Som Warning",
          onClick: () => {
            testSound("warning");
            toast.warning("Som de aviso!", "Tom médio com vibrato");
          }
        },
        {
          label: "Som Info",
          onClick: () => {
            testSound("info");
            toast.info("Som de info!", "Tom suave e curto");
          }
        },
        {
          label: "Som Critical",
          onClick: () => {
            toast.error("Som crítico!", "Sequência de alertas urgentes", {
              priority: "critical"
            });
          }
        }
      ]
    },
    {
      category: "Agrupamento de Toasts",
      items: [
        {
          label: "3 Arquivos Enviados",
          onClick: () => {
            toast.success("Arquivo enviado", "documento.pdf");
            setTimeout(() => toast.success("Arquivo enviado", "imagem.jpg"), 200);
            setTimeout(() => toast.success("Arquivo enviado", "planilha.xlsx"), 400);
          }
        },
        {
          label: "Múltiplos Erros",
          onClick: () => {
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => {
                toast.error("Erro ao processar", `Falha no item ${i}`);
              }, i * 150);
            }
          }
        },
        {
          label: "Notificações Repetidas",
          onClick: () => {
            for (let i = 1; i <= 7; i++) {
              setTimeout(() => {
                toast.info("Nova mensagem recebida");
              }, i * 200);
            }
          }
        },
        {
          label: "Downloads Múltiplos",
          onClick: () => {
            for (let i = 1; i <= 4; i++) {
              setTimeout(() => {
                toast.success("Download concluído", "Arquivo salvo com sucesso");
              }, i * 300);
            }
          }
        },
        {
          label: "Warnings Agrupados",
          onClick: () => {
            for (let i = 1; i <= 6; i++) {
              setTimeout(() => {
                toast.warning("Atenção necessária", "Verifique os dados antes de continuar");
              }, i * 250);
            }
          }
        }
      ]
    },
    {
      category: "Sistema de Prioridades",
      items: [
        {
          label: "Critical Priority",
          onClick: () => toast.success("Alerta Crítico!", "Este toast aparece imediatamente, removendo outros se necessário", {
            priority: "critical",
            duration: 10000
          })
        },
        {
          label: "High Priority",
          onClick: () => toast.warning("Alta Prioridade", "Este toast tem prioridade alta na fila", {
            priority: "high"
          })
        },
        {
          label: "Normal Priority",
          onClick: () => toast.info("Prioridade Normal", "Este é um toast com prioridade padrão", {
            priority: "normal"
          })
        },
        {
          label: "Low Priority",
          onClick: () => toast.info("Baixa Prioridade", "Este toast aguarda na fila se houver muitos", {
            priority: "low"
          })
        }
      ]
    },
    {
      category: "Teste de Queue",
      items: [
        {
          label: "Criar 10 Toasts",
          onClick: () => {
            for (let i = 1; i <= 10; i++) {
              setTimeout(() => {
                toast.info(`Toast ${i}`, `Este é o toast número ${i}`, {
                  priority: i % 2 === 0 ? "high" : "normal"
                });
              }, i * 100);
            }
          }
        },
        {
          label: "Mix de Prioridades",
          onClick: () => {
            toast.info("Baixa 1", "Prioridade baixa", { priority: "low" });
            toast.info("Normal 1", "Prioridade normal", { priority: "normal" });
            toast.warning("Alta 1", "Prioridade alta", { priority: "high" });
            toast.error("Crítica!", "Prioridade crítica - aparece primeiro!", { priority: "critical" });
            toast.info("Baixa 2", "Prioridade baixa", { priority: "low" });
            toast.warning("Alta 2", "Prioridade alta", { priority: "high" });
          }
        },
        {
          label: "Spam de Toasts",
          onClick: () => {
            for (let i = 1; i <= 20; i++) {
              const priorities: any = ["critical", "high", "normal", "low"];
              const priority = priorities[Math.floor(Math.random() * 4)];
              toast.info(`Toast ${i}`, `Prioridade: ${priority}`, { priority });
            }
          }
        }
      ]
    },
    {
      category: "Helpers Simples (Recomendado)",
      items: [
        {
          label: "toast.success()",
          onClick: () => toast.success("Operação concluída!", "Seus dados foram salvos")
        },
        {
          label: "toast.error()",
          onClick: () => toast.error("Erro ao processar", "Tente novamente mais tarde")
        },
        {
          label: "toast.warning()",
          onClick: () => toast.warning("Atenção!", "Verifique os dados antes de continuar")
        },
        {
          label: "toast.info()",
          onClick: () => toast.info("Nova atualização", "Versão 2.0 disponível")
        }
      ]
    },
    {
      category: "Helpers do Hook",
      items: [
        {
          label: "success()",
          onClick: () => success("Dados salvos!", "Operação realizada com sucesso")
        },
        {
          label: "error()",
          onClick: () => error("Falha na operação", "Não foi possível completar")
        },
        {
          label: "warning()",
          onClick: () => warning("Verifique os dados", "Alguns campos estão vazios")
        },
        {
          label: "info()",
          onClick: () => info("Informação", "Sistema será atualizado em breve")
        }
      ]
    },
    {
      category: "Loading & Update",
      items: [
        {
          label: "Loading Toast",
          onClick: () => {
            const id = toast.loading("Processando...", "Aguarde um momento");
            setTimeout(() => {
              toast.update(id, {
                title: "Concluído!",
                description: "Processamento finalizado",
                variant: "success",
                duration: 5000
              });
            }, 3000);
          }
        },
        {
          label: "Multi-Step Loading",
          onClick: () => {
            const id = loading("Etapa 1/3", "Validando dados...");
            setTimeout(() => {
              update(id, { title: "Etapa 2/3", description: "Salvando no servidor..." });
            }, 1500);
            setTimeout(() => {
              update(id, { title: "Etapa 3/3", description: "Finalizando..." });
            }, 3000);
            setTimeout(() => {
              update(id, { 
                title: "Processo completo!", 
                description: "Todas as etapas foram concluídas",
                variant: "success",
                duration: 5000
              });
            }, 4500);
          }
        },
        {
          label: "Manual Dismiss",
          onClick: () => {
            const id = toast.info("Toast manual", "Clique no próximo botão para fechar", {
              duration: 999999
            });
            setTimeout(() => {
              toast.dismiss(id);
            }, 5000);
          }
        }
      ]
    },
    {
      category: "Promise Helper",
      items: [
        {
          label: "Success Promise",
          onClick: async () => {
            await toast.promise(
              new Promise(resolve => setTimeout(() => resolve({ id: 123 }), 2000)),
              {
                loading: "Salvando dados...",
                success: "Dados salvos com sucesso!",
                error: "Erro ao salvar dados"
              }
            );
          }
        },
        {
          label: "Error Promise",
          onClick: async () => {
            try {
              await toast.promise(
                new Promise((_, reject) => setTimeout(() => reject(new Error("Falha")), 2000)),
                {
                  loading: "Processando...",
                  success: "Concluído!",
                  error: "Erro ao processar"
                }
              );
            } catch (e) {
              // Promise rejeitada
            }
          }
        },
        {
          label: "Dynamic Messages",
          onClick: async () => {
            await promise(
              new Promise(resolve => setTimeout(() => resolve({ count: 42 }), 2000)),
              {
                loading: "Carregando dados...",
                success: (data: any) => `${data.count} itens carregados!`,
                error: (err: any) => `Erro: ${err.message}`
              }
            );
          }
        }
      ]
    },
    {
      category: "Variantes Básicas",
      items: [
        {
          label: "Success",
          onClick: () => success("Operação bem-sucedida!", "Seus dados foram salvos com sucesso no sistema")
        },
        {
          label: "Error",
          onClick: () => error("Erro ao processar", "Não foi possível completar a operação. Tente novamente.")
        },
        {
          label: "Warning",
          onClick: () => warning("Atenção necessária", "Verifique os dados antes de continuar com esta ação")
        },
        {
          label: "Info",
          onClick: () => info("Nova atualização disponível", "Uma nova versão do sistema está disponível para instalação")
        },
        {
          label: "Default",
          onClick: () => toast.info("Notificação do sistema", "Esta é uma mensagem informativa geral")
        }
      ]
    },
    {
      category: "Ícones Customizados",
      items: [
        {
          label: "Rocket",
          onClick: () => toast.success("Lançamento realizado!", "Nova funcionalidade publicada com sucesso", { icon: Rocket })
        },
        {
          label: "Heart",
          onClick: () => toast.info("Obrigado pelo feedback!", "Sua avaliação é muito importante para nós", { icon: Heart })
        },
        {
          label: "Star",
          onClick: () => toast.success("Parabéns!", "Você conquistou uma nova conquista", { icon: Star })
        },
        {
          label: "Zap",
          onClick: () => toast.warning("Ação rápida!", "Processamento em alta velocidade", { icon: Zap })
        }
      ]
    },
    {
      category: "Com Ações",
      items: [
        {
          label: "Com Botão",
          onClick: () => toast.success("Relatório gerado", "Seu relatório está pronto para download", {
            icon: Download,
            action: {
              label: "Baixar",
              onClick: () => alert("Download iniciado!")
            }
          })
        },
        {
          label: "Confirmação",
          onClick: () => toast.error("Item excluído", "O item foi removido permanentemente", {
            icon: Trash2,
            action: {
              label: "Desfazer",
              onClick: () => toast.success("Ação desfeita!")
            }
          })
        },
        {
          label: "Upload",
          onClick: () => toast.success("Arquivo enviado", "Upload concluído com sucesso", {
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
          onClick: () => toast.success("Copiado!", undefined, { duration: 2000 })
        },
        {
          label: "Normal (5s)",
          onClick: () => toast.info("Notificação padrão", "Duração de 5 segundos", { duration: 5000 })
        },
        {
          label: "Longo (10s)",
          onClick: () => toast.warning("Mensagem importante", "Esta mensagem fica visível por mais tempo para leitura completa", {
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

        {/* Position & Queue Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>
          <div className="space-y-6">
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
            
            <div>
              <Label htmlFor="maxVisible">
                Máximo de Toasts Visíveis ({queuedCount} na fila)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="maxVisible"
                  type="number"
                  min="1"
                  max="10"
                  value={customMaxVisible}
                  onChange={(e) => setCustomMaxVisible(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => setMaxVisible(parseInt(customMaxVisible))}
                  variant="outline"
                >
                  Aplicar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toasts excedentes aguardam na fila por prioridade
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-bex" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Label htmlFor="sound-toggle">Sons de Notificação</Label>
                </div>
                <Switch
                  id="sound-toggle"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="volume">Volume: {Math.round(soundVolume * 100)}%</Label>
                    </div>
                    <Slider
                      id="volume"
                      value={[soundVolume * 100]}
                      onValueChange={(values) => setSoundVolume(values[0] / 100)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound("success")}
                    >
                      Testar Success
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound("error")}
                    >
                      Testar Error
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound("warning")}
                    >
                      Testar Warning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound("info")}
                    >
                      Testar Info
                    </Button>
                  </div>
                </div>
              )}
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
                onClick={() => success(customTitle, customDescription, {
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
                toast.success("Toast 1");
                setTimeout(() => toast.info("Toast 2"), 500);
                setTimeout(() => toast.warning("Toast 3"), 1000);
              }}
              variant="outline"
            >
              Mostrar 3 Toasts
            </Button>
            <Button
              onClick={() => {
                for (let i = 1; i <= 5; i++) {
                  setTimeout(() => {
                    const variants: any = ["success", "error", "warning", "info", "default"];
                    const methods: any = { 
                      success: toast.success, 
                      error: toast.error, 
                      warning: toast.warning, 
                      info: toast.info,
                      default: toast.info
                    };
                    const variant = variants[i % 5];
                    methods[variant](`Notificação ${i}`, `Esta é a notificação número ${i}`);
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
