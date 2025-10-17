export function estimateTokens(text: string): number {
  // GPT-4 usa ~1 token por 4 caracteres em português
  return Math.ceil(text.length / 4);
}

export function estimateCost(inputTokens: number, outputTokens: number) {
  const INPUT_COST_PER_1M = 2.50;  // GPT-4.1 pricing
  const OUTPUT_COST_PER_1M = 10.00;
  
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M;
  
  return {
    inputCost,
    outputCost,
    total: inputCost + outputCost,
    formatted: `$${(inputCost + outputCost).toFixed(4)} USD`
  };
}

export function buildPromptForEstimation(briefingData: any): string {
  const tomTexto = Array.isArray(briefingData.tom) ? briefingData.tom.join(', ') : (briefingData.tom || 'profissional');
  const estiloTexto = Array.isArray(briefingData.estilo) ? briefingData.estilo.join(', ') : (briefingData.estilo || 'narrativo');
  const tomCriativoTexto = Array.isArray(briefingData.tom_criativo) ? briefingData.tom_criativo.join(', ') : (briefingData.tom_criativo || 'criativo');
  
  const systemPrompt = `Você é um roteirista audiovisual profissional especializado em criar roteiros impactantes para vídeos institucionais, publicitários e de marketing.

**🎨 TOM E ESTILO:**
- Tom de voz: ${tomTexto}
- Estilo narrativo: ${estiloTexto}
- Tons criativos: ${tomCriativoTexto}
- Persona: ${briefingData.persona_voz || 'Profissional e confiável'}

**📋 INSTRUÇÕES OBRIGATÓRIAS:**
Crie um roteiro audiovisual COMPLETO em formato Markdown com IDENTIFICAÇÃO, OBJETIVO E TOM, ROTEIRO (ABERTURA, DESENVOLVIMENTO, ENCERRAMENTO), e REFERÊNCIAS TÉCNICAS.`;
  
  const userPrompt = `Crie um roteiro audiovisual para ${briefingData.titulo || 'projeto audiovisual'}.

**Objetivo**: ${briefingData.objetivo || 'Não informado'}
**Plataforma**: ${briefingData.plataforma || 'reels'}
**Duração**: ${briefingData.duracao_prevista_seg || 30}s
**Público-alvo**: ${Array.isArray(briefingData.publico_alvo) ? briefingData.publico_alvo.join(', ') : briefingData.publico_alvo || 'Público geral'}
**CTA**: ${briefingData.cta || 'Saiba mais!'}`;
  
  return systemPrompt + '\n\n' + userPrompt;
}
