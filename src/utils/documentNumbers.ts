import { supabase } from "@/integrations/supabase/client";

export async function gerarNumeroDocumento(
  tipo: "orcamento" | "proposta" | "contrato" | "fatura",
  ano?: number
): Promise<string> {
  const anoAtual = ano || new Date().getFullYear();

  try {
    const { data, error } = await supabase.rpc("gerar_numero_documento", {
      tipo,
      ano: anoAtual,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao gerar número do documento:", error);
    // Fallback se a função do DB falhar
    const timestamp = Date.now();
    const prefix = tipo.substring(0, 4).toUpperCase();
    return `${prefix}-${anoAtual}-${timestamp}`;
  }
}
