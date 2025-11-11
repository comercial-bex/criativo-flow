import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PropostaPreview } from "@/components/Proposta/PropostaPreview";
import { smartToast } from "@/lib/smart-toast";
import { CheckCircle2, XCircle, Pen, Upload, AlertCircle } from "lucide-react";

export default function AssinaturaPublica() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [desenhando, setDesenhando] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Buscar dados da assinatura pelo token
  const { data: assinatura, isLoading, error } = useQuery({
    queryKey: ["assinatura_publica", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposta_assinaturas")
        .select(`
          *,
          propostas (
            *,
            clientes (*),
            proposta_itens (*)
          )
        `)
        .eq("token_assinatura", token)
        .single();

      if (error) throw error;
      
      // Registrar visualização
      if (data && !data.data_visualizacao) {
        await supabase
          .from("proposta_assinaturas")
          .update({ data_visualizacao: new Date().toISOString() })
          .eq("id", data.id);
      }
      
      return data;
    },
    enabled: !!token,
  });

  const assinarProposta = useMutation({
    mutationFn: async (assinaturaBase64: string) => {
      if (!assinatura) return;

      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { data, error } = await supabase.rpc('submit_proposta_signature' as any, {
        p_token: token,
        p_nome_completo: assinatura.nome_assinante || '',
        p_email: assinatura.email_assinante || '',
        p_signature_base64: assinaturaBase64,
        p_ip_address: ip,
        p_aceite_termos: aceiteTermos
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao processar assinatura');
      }
      
      return result;
    },
    onSuccess: () => {
      smartToast.success("Proposta assinada com sucesso!");
      setAssinando(false);
      setTimeout(() => navigate('/'), 2000);
    },
    onError: (error: any) => {
      smartToast.error("Erro ao assinar proposta", error.message);
      setAssinando(false);
    },
  });

  // Canvas para desenhar assinatura
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      lastX = x;
      lastY = y;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastX = x;
      lastY = y;
      setDesenhando(true);
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, []);

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDesenhando(false);
  };

  const handleAssinar = async () => {
    if (!aceiteTermos) {
      smartToast.error("Você precisa aceitar os termos para assinar");
      return;
    }

    if (!desenhando) {
      smartToast.error("Por favor, desenhe sua assinatura");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const assinaturaBase64 = canvas.toDataURL('image/png');
    setAssinando(true);
    assinarProposta.mutate(assinaturaBase64);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error || !assinatura) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-6 h-6" />
              <CardTitle>Link Inválido</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Este link de assinatura não é válido ou expirou.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Voltar para Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assinatura.status === 'assinado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-6 h-6" />
              <CardTitle>Já Assinado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você já assinou esta proposta anteriormente.
            </p>
            {assinatura.data_assinatura && (
              <p className="text-sm text-muted-foreground">
                Data da assinatura: {new Date(assinatura.data_assinatura).toLocaleString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const proposta = assinatura.propostas;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Assinatura de Proposta</CardTitle>
                <p className="text-muted-foreground">
                  {assinatura.nome_assinante} - {assinatura.cargo || assinatura.email_assinante}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Proposta</p>
                <p className="font-mono text-sm">#{proposta.numero}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Preview da Proposta */}
        <div className="mb-6">
          <PropostaPreview 
            proposta={proposta} 
            itens={proposta.proposta_itens || []}
          />
        </div>

        {/* Área de Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Assinar Proposta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Canvas para desenhar assinatura */}
            <div>
              <Label className="mb-2 block">Desenhe sua assinatura abaixo:</Label>
              <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full bg-white rounded cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={limparAssinatura}
                className="mt-2"
              >
                Limpar Assinatura
              </Button>
            </div>

            <Separator />

            {/* Aceite de Termos */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="termos"
                checked={aceiteTermos}
                onCheckedChange={(checked) => setAceiteTermos(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="termos" className="cursor-pointer">
                  Li e concordo com os termos da proposta comercial apresentada. 
                  Confirmo que estou autorizado a assinar em nome da empresa/organização representada.
                </Label>
              </div>
            </div>

            {/* Avisos */}
            <div className="flex items-start gap-3 p-3 bg-info/10 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-info mt-0.5" />
              <p className="text-muted-foreground">
                Sua assinatura será registrada com data, hora e endereço IP para fins de 
                validade jurídica do documento.
              </p>
            </div>

            {/* Botão de Assinar */}
            <Button
              onClick={handleAssinar}
              disabled={!aceiteTermos || !desenhando || assinando}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {assinando ? "Assinando..." : "Confirmar Assinatura"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
