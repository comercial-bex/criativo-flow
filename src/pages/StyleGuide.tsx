import { BexCard, BexCardHeader, BexCardTitle, BexCardContent, BexCardDescription } from "@/components/ui/bex-card";
import { BexButton } from "@/components/ui/bex-button";
import { BexBadge } from "@/components/ui/bex-badge";
import { BexAvatar, BexAvatarFallback } from "@/components/ui/bex-avatar";
import { Dialog, DialogTrigger, BexDialogContent, BexDialogHeader, BexDialogTitle } from "@/components/ui/bex-dialog";
import { Sparkles, Zap, Trophy } from "lucide-react";

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* Header Gaming */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-bex via-bex-light to-bex-dark bg-clip-text text-transparent">
          BEX Design System
        </h1>
        <p className="text-muted-foreground text-lg">
          Sistema moderno com identidade gaming verde
        </p>
      </div>

      {/* Seção Cards */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BexCard variant="default">
            <BexCardHeader>
              <BexCardTitle>Default</BexCardTitle>
              <BexCardDescription>Card padrão limpo</BexCardDescription>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">Ideal para conteúdo geral</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glass">
            <BexCardHeader>
              <BexCardTitle>Glass</BexCardTitle>
              <BexCardDescription>Efeito vidro translúcido</BexCardDescription>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">Blur + transparência</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="glow">
            <BexCardHeader>
              <BexCardTitle>Glow</BexCardTitle>
              <BexCardDescription>Hover com brilho verde</BexCardDescription>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">Shadow dinâmico</p>
            </BexCardContent>
          </BexCard>

          <BexCard variant="gaming" withGlow>
            <BexCardHeader>
              <BexCardTitle>Gaming</BexCardTitle>
              <BexCardDescription>Full gaming experience</BexCardDescription>
            </BexCardHeader>
            <BexCardContent>
              <p className="text-sm text-muted-foreground">Com glow externo</p>
            </BexCardContent>
          </BexCard>
        </div>
      </section>

      {/* Seção Buttons */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <BexButton variant="bex">
            <Sparkles className="mr-2 h-4 w-4" />
            BEX Primary
          </BexButton>
          <BexButton variant="bexGaming">
            <Zap className="mr-2 h-4 w-4" />
            BEX Gaming
          </BexButton>
          <BexButton variant="bexOutline">
            BEX Outline
          </BexButton>
          <BexButton variant="bexGhost">
            BEX Ghost
          </BexButton>
          <BexButton variant="bex" size="sm">
            Small
          </BexButton>
          <BexButton variant="bex" size="lg">
            Large
          </BexButton>
        </div>
      </section>

      {/* Seção Badges */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <BexBadge variant="bex">
            <Trophy className="mr-1 h-3 w-3" />
            Success
          </BexBadge>
          <BexBadge variant="bexOutline">Outline</BexBadge>
          <BexBadge variant="bexGlow">Glow Effect</BexBadge>
          <BexBadge variant="bexGaming">Gaming</BexBadge>
          <BexBadge variant="secondary">Secondary</BexBadge>
          <BexBadge variant="destructive">Error</BexBadge>
        </div>
      </section>

      {/* Seção Avatars */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Avatars</h2>
        <div className="flex gap-6 items-center">
          <div className="text-center space-y-2">
            <BexAvatar>
              <BexAvatarFallback>JD</BexAvatarFallback>
            </BexAvatar>
            <p className="text-xs text-muted-foreground">Default</p>
          </div>
          <div className="text-center space-y-2">
            <BexAvatar withGlow>
              <BexAvatarFallback>AB</BexAvatarFallback>
            </BexAvatar>
            <p className="text-xs text-muted-foreground">With Glow</p>
          </div>
          <div className="text-center space-y-2">
            <BexAvatar gaming>
              <BexAvatarFallback>GG</BexAvatarFallback>
            </BexAvatar>
            <p className="text-xs text-muted-foreground">Gaming</p>
          </div>
        </div>
      </section>

      {/* Seção Dialog */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Dialogs</h2>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <BexButton variant="bexGaming">Abrir Dialog Gaming</BexButton>
            </DialogTrigger>
            <BexDialogContent variant="gaming">
              <BexDialogHeader>
                <BexDialogTitle gaming>Dialog Gaming</BexDialogTitle>
              </BexDialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Este dialog usa a variante gaming com blur, transparência e bordas BEX.
                </p>
                <BexButton variant="bex" className="w-full">Confirmar</BexButton>
              </div>
            </BexDialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <BexButton variant="bexOutline">Abrir Dialog Glass</BexButton>
            </DialogTrigger>
            <BexDialogContent variant="glass">
              <BexDialogHeader>
                <BexDialogTitle>Dialog Glass</BexDialogTitle>
              </BexDialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Variante glass com efeito de vidro translúcido.
                </p>
              </div>
            </BexDialogContent>
          </Dialog>
        </div>
      </section>

      {/* Seção Cores */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Paleta de Cores BEX</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-bex shadow-bex transition-all hover:scale-105"></div>
            <p className="text-xs text-center font-mono">#54C43D</p>
            <p className="text-xs text-center text-muted-foreground">bex (Primary)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-bex-light transition-all hover:scale-105"></div>
            <p className="text-xs text-center font-mono">#6dd34f</p>
            <p className="text-xs text-center text-muted-foreground">bex-light</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-bex-dark transition-all hover:scale-105"></div>
            <p className="text-xs text-center font-mono">#47a834</p>
            <p className="text-xs text-center text-muted-foreground">bex-dark</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-bex-50 transition-all hover:scale-105"></div>
            <p className="text-xs text-center text-muted-foreground">bex-50</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-bex-900 transition-all hover:scale-105"></div>
            <p className="text-xs text-center text-muted-foreground">bex-900</p>
          </div>
        </div>
      </section>

      {/* Seção Efeitos */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Efeitos Especiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-bex p-6 rounded-lg">
            <h3 className="font-bold mb-2 text-bex">Glass Effect</h3>
            <p className="text-sm text-muted-foreground">
              Transparência + blur para efeito de vidro
            </p>
            <code className="text-xs mt-2 block">.glass-bex</code>
          </div>
          <div className="glow-bex p-6 rounded-lg bg-card">
            <h3 className="font-bold mb-2 text-bex">Glow Effect</h3>
            <p className="text-sm text-muted-foreground">
              Sombra verde luminosa com intensidade
            </p>
            <code className="text-xs mt-2 block">.glow-bex</code>
          </div>
          <div className="hover-lift-bex p-6 rounded-lg bg-card border border-border">
            <h3 className="font-bold mb-2 text-bex">Hover Lift</h3>
            <p className="text-sm text-muted-foreground">
              Eleva o elemento no hover com shadow
            </p>
            <code className="text-xs mt-2 block">.hover-lift-bex</code>
          </div>
        </div>
      </section>

      {/* Seção Gradientes */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Gradientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gradient-bex p-8 rounded-lg text-center">
            <h3 className="font-bold text-white text-xl mb-2">Primary Gradient</h3>
            <p className="text-white/80 text-sm">from-bex via-bex-light to-bex-dark</p>
            <code className="text-xs mt-2 block text-white/60">.gradient-bex</code>
          </div>
          <div className="p-8 rounded-lg text-center bg-gradient-to-r from-bex/30 via-bex-light/20 to-black/50">
            <h3 className="font-bold text-white text-xl mb-2">Gaming Gradient</h3>
            <p className="text-white/80 text-sm">from-bex/30 via-bex-light/20 to-black/50</p>
          </div>
        </div>
      </section>

      {/* Seção Animações */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-bex mb-6">Animações</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-card border rounded-lg text-center animate-fade-in">
            <p className="font-semibold">Fade In</p>
            <code className="text-xs">.animate-fade-in</code>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center animate-scale-in">
            <p className="font-semibold">Scale In</p>
            <code className="text-xs">.animate-scale-in</code>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center animate-pulse-glow">
            <p className="font-semibold">Pulse Glow</p>
            <code className="text-xs">.animate-pulse-glow</code>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center hover:animate-pulse">
            <p className="font-semibold">Pulse (hover)</p>
            <code className="text-xs">.animate-pulse</code>
          </div>
        </div>
      </section>
    </div>
  );
}
