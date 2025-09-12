import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/SectionHeader";
import { Check, Star, Zap, Target } from "lucide-react";

const planos = [
  {
    id: "90",
    nome: "Plano 90º",
    destaque: false,
    icon: Target,
    descricao: "Ideal para começar sua presença digital",
    preco: "R$ 997",
    periodo: "/mês",
    recursos: [
      "12 Posts mensais (Feed/Story)",
      "Criação de Layout Peças OFF",
      "Elaboração da Linha Editorial",
      "3 Suporte e Gravação de Reels",
      "Gerenciador de Conteúdos",
      "Tráfego Pago - Meta & Google: até 4 anúncios simultâneos no Facebook + 1 no Google Ads"
    ]
  },
  {
    id: "180",
    nome: "Plano 180º",
    destaque: true,
    icon: Star,
    descricao: "Mais completo para empresas em crescimento",
    preco: "R$ 1.497",
    periodo: "/mês",
    recursos: [
      "16 Posts mensais (Feed/Story)",
      "Criação de Layout Peças OFF",
      "Elaboração da Linha Editorial",
      "6 Suporte e Gravação de Reels",
      "Gerenciador de Conteúdos",
      "Suporte Full & Gestão de Crises",
      "Tráfego Pago - Meta & Google: até 10 anúncios simultâneos no Facebook + 3 no Google Ads",
      "Estratégias de Captação de Leads (Landing Page)"
    ]
  },
  {
    id: "360",
    nome: "Plano 360º",
    destaque: false,
    icon: Zap,
    descricao: "Solução completa para máximo crescimento",
    preco: "R$ 2.197",
    periodo: "/mês",
    recursos: [
      "24 Posts mensais (Feed/Story)",
      "Criação de Layout Peças OFF",
      "Elaboração da Linha Editorial",
      "8 Suporte e Gravação de Reels",
      "Gerenciador de Conteúdos",
      "Suporte Full & Gestão de Crises",
      "Tráfego Pago - Meta & Google: até 15 anúncios simultâneos no Facebook + 5 no Google Ads",
      "Estratégias de Captação de Leads (Landing Page)",
      "Consultoria em Branding"
    ]
  }
];

export default function Planos() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Planos de Assinatura"
        description="Escolha o plano ideal para o crescimento digital do seu negócio"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => {
          const IconComponent = plano.icon;
          return (
            <Card
              key={plano.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plano.destaque
                  ? "border-primary shadow-md scale-105"
                  : "hover:border-primary/50"
              }`}
            >
              {plano.destaque && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plano.destaque 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plano.nome}</CardTitle>
                <CardDescription className="text-sm">
                  {plano.descricao}
                </CardDescription>
                <div className="flex items-end justify-center mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plano.preco}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plano.periodo}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plano.recursos.map((recurso, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {recurso}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className={`w-full ${
                    plano.destaque
                      ? "bg-primary hover:bg-primary/90"
                      : "variant-outline"
                  }`}
                  variant={plano.destaque ? "default" : "outline"}
                >
                  Escolher {plano.nome}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Precisa de algo personalizado?</h3>
          <p className="text-muted-foreground mb-4">
            Entre em contato conosco para criar um plano sob medida para suas necessidades específicas.
          </p>
          <Button variant="outline">
            Falar com Consultor
          </Button>
        </div>
      </div>
    </div>
  );
}