import { useState } from "react";
import { BexCard, BexCardHeader, BexCardTitle, BexCardContent } from "@/components/ui/bex-card";
import { BexButton } from "@/components/ui/bex-button";
import { BexBadge } from "@/components/ui/bex-badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Play, Pause, Zap, Gamepad2, Trophy, Rocket, 
  Star, Heart, CheckCircle, AlertCircle 
} from "lucide-react";

export default function DesignSystemShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fade-in">
        <h1 className="bex-title-primary">🎮 BEX Gaming Design System</h1>
        <p className="bex-text-muted">
          Biblioteca completa de componentes e exemplos práticos
        </p>
      </div>

      <Separator className="bg-bex/30" />

      {/* Seção 1: Cards */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Cards Variants</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BexCard variant="default">
            <BexCardHeader>
              <BexCardTitle>Default Card</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="bex-body">Card padrão com borda sutil</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glass">
            <BexCardHeader>
              <BexCardTitle>Glass Card</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="bex-body">Efeito glassmorphism com blur</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glow">
            <BexCardHeader>
              <BexCardTitle>Glow Card</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="bex-body">Com brilho verde BEX</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="gaming" withGlow>
            <BexCardHeader>
              <BexCardTitle>Gaming Card</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="bex-body">Estilo gaming completo</p>
            </BexCardContent>
          </BexCard>
        </div>
      </section>

      {/* Seção 2: Buttons */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Button Variants</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <BexCard variant="glass">
          <BexCardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">BEX Gaming</p>
                <BexButton variant="bexGaming" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Action
                </BexButton>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">BEX Solid</p>
                <BexButton variant="bex" className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Solid
                </BexButton>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">BEX Outline</p>
                <BexButton variant="bexOutline" className="w-full">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Outline
                </BexButton>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">BEX Ghost</p>
                <BexButton variant="bexGhost" className="w-full">
                  <Trophy className="mr-2 h-4 w-4" />
                  Ghost
                </BexButton>
              </div>
            </div>

            <Separator className="my-4 bg-bex/20" />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Small</p>
                <BexButton variant="bexGaming" size="sm" className="w-full">
                  Small
                </BexButton>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Default</p>
                <BexButton variant="bexGaming" className="w-full">
                  Default
                </BexButton>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Large</p>
                <BexButton variant="bexGaming" size="lg" className="w-full">
                  Large
                </BexButton>
              </div>
            </div>
          </BexCardContent>
        </BexCard>
      </section>

      {/* Seção 3: Badges */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Badge Variants</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <BexCard variant="glass">
          <BexCardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <BexBadge variant="bex">
                <Star className="mr-1 h-3 w-3" />
                BEX Solid
              </BexBadge>

              <BexBadge variant="bexOutline">
                <Heart className="mr-1 h-3 w-3" />
                BEX Outline
              </BexBadge>

              <BexBadge variant="bexGlow">
                <Rocket className="mr-1 h-3 w-3" />
                BEX Glow
              </BexBadge>

              <BexBadge variant="bexGaming">
                <Zap className="mr-1 h-3 w-3" />
                BEX Gaming
              </BexBadge>

              <BexBadge variant="default">Default</BexBadge>
              <BexBadge variant="secondary">Secondary</BexBadge>
              <BexBadge variant="destructive">Destructive</BexBadge>
              <BexBadge variant="outline">Outline</BexBadge>
            </div>
          </BexCardContent>
        </BexCard>
      </section>

      {/* Seção 4: Typography */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Typography Scale</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <BexCard variant="gaming" withGlow>
          <BexCardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Primary Title</p>
              <h1 className="bex-title-primary">Título Principal - Montserrat Bold</h1>
            </div>

            <Separator className="bg-bex/20" />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Secondary Title</p>
              <h2 className="bex-title-secondary">Subtítulo - Montserrat Semibold</h2>
            </div>

            <Separator className="bg-bex/20" />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Body Text</p>
              <p className="bex-body">
                Texto do corpo usando Inter com peso normal. Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit.
              </p>
            </div>

            <Separator className="bg-bex/20" />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Muted Text</p>
              <p className="bex-text-muted">
                Texto secundário com opacidade reduzida para informações complementares.
              </p>
            </div>
          </BexCardContent>
        </BexCard>
      </section>

      {/* Seção 5: Forms & Inputs */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Forms & Inputs</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BexCard variant="glass">
            <BexCardHeader>
              <BexCardTitle>Input Examples</BexCardTitle>
            </BexCardHeader>
            <BexCardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Default Input
                </label>
                <Input placeholder="Digite aqui..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Input with Icon
                </label>
                <div className="relative">
                  <Input placeholder="Buscar..." className="pl-10" />
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bex" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Disabled Input
                </label>
                <Input placeholder="Desabilitado" disabled />
              </div>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glass">
            <BexCardHeader>
              <BexCardTitle>Form Example</BexCardTitle>
            </BexCardHeader>
            <BexCardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input placeholder="Seu nome completo" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="seu@email.com" />
              </div>

              <div className="flex gap-2">
                <BexButton variant="bexGaming" className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Salvar
                </BexButton>
                <BexButton variant="bexOutline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </BexButton>
              </div>
            </BexCardContent>
          </BexCard>
        </div>
      </section>

      {/* Seção 6: Tabs */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Tabs Component</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <BexCard variant="gaming" withGlow>
          <BexCardContent className="p-6">
            <Tabs defaultValue="tab1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1">Gaming</TabsTrigger>
                <TabsTrigger value="tab2">Stats</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="tab1" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-bex-gaming p-4 rounded-lg space-y-2">
                    <Gamepad2 className="h-8 w-8 text-bex" />
                    <h3 className="font-semibold">Gaming Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Modo otimizado para performance
                    </p>
                  </div>
                  <div className="glass-bex-gaming p-4 rounded-lg space-y-2">
                    <Trophy className="h-8 w-8 text-bex" />
                    <h3 className="font-semibold">Achievements</h3>
                    <p className="text-sm text-muted-foreground">
                      12 conquistas desbloqueadas
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tab2" className="mt-4">
                <div className="glass-bex p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projetos Ativos</span>
                    <BexBadge variant="bexGaming">8</BexBadge>
                  </div>
                  <Separator className="bg-bex/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tarefas Concluídas</span>
                    <BexBadge variant="bexGlow">142</BexBadge>
                  </div>
                  <Separator className="bg-bex/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <BexBadge variant="bex">98%</BexBadge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tab3" className="mt-4">
                <div className="space-y-4">
                  <div className="glass-bex-light p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Configurações</h3>
                    <p className="text-sm text-muted-foreground">
                      Personalize sua experiência BEX Gaming
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </BexCardContent>
        </BexCard>
      </section>

      {/* Seção 7: Animations & Effects */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Animations & Hover Effects</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BexCard variant="gaming" className="hover-lift-bex cursor-pointer">
            <BexCardHeader>
              <BexCardTitle>Hover Lift</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">
                Passe o mouse para ver o efeito de elevação
              </p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glass" className="animate-scale-in">
            <BexCardHeader>
              <BexCardTitle>Scale In</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">
                Animação de entrada com escala
              </p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glow" className="animate-pulse-glow">
            <BexCardHeader>
              <BexCardTitle>Pulse Glow</BexCardTitle>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">
                Brilho pulsante contínuo
              </p>
            </BexCardContent>
          </BexCard>
        </div>
      </section>

      {/* Seção 8: Interactive Example */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="bex-title-secondary">Interactive Component</h2>
          <Separator className="flex-1 bg-bex/20" />
        </div>

        <BexCard variant="gaming" withGlow>
          <BexCardHeader>
            <BexCardTitle>Media Player Example</BexCardTitle>
          </BexCardHeader>
          <BexCardContent className="space-y-6">
            <div className="glass-bex-gaming p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">BEX Gaming Soundtrack</h3>
                  <p className="text-sm text-muted-foreground">Epic Gaming Music</p>
                </div>
                <BexBadge variant="bexGlow" className="animate-pulse-glow">
                  LIVE
                </BexBadge>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-bex to-bex-light w-2/3 transition-all duration-300" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2:34</span>
                  <span>4:12</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <BexButton variant="bexOutline" size="icon">
                  <Rocket className="h-5 w-5" />
                </BexButton>
                
                <BexButton 
                  variant="bexGaming" 
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-8"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play
                    </>
                  )}
                </BexButton>

                <BexButton variant="bexOutline" size="icon">
                  <Star className="h-5 w-5" />
                </BexButton>
              </div>
            </div>

            {isPlaying && (
              <div className="glass-bex-light p-4 rounded-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-bex rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 24 + 8}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-bex font-medium">
                    Now Playing...
                  </p>
                </div>
              </div>
            )}
          </BexCardContent>
        </BexCard>
      </section>

      {/* Footer */}
      <div className="text-center py-8 space-y-2 animate-fade-in">
        <Separator className="bg-bex/30 mb-4" />
        <p className="bex-text-muted">
          🎮 BEX Gaming Design System - Versão 1.0
        </p>
        <p className="text-xs text-muted-foreground">
          Todos os componentes são reutilizáveis e seguem o padrão BEX Gaming
        </p>
      </div>
    </div>
  );
}
