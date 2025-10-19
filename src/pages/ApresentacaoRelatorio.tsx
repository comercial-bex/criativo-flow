import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Maximize, ChevronLeft, ChevronRight, Minimize, TrendingUp, Target, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SWOTRadarChart } from '@/components/relatorios/SWOTRadarChart';
import { ComparativoMetricas } from '@/components/relatorios/ComparativoMetricas';
import { TimelineAcoes } from '@/components/relatorios/TimelineAcoes';
import { HighlightsNumericos } from '@/components/relatorios/HighlightsNumericos';

interface RelatorioData {
  titulo: string;
  relatorio_markdown: string;
  cliente_analise: any;
  cliente_onboarding?: any;
  versao: number;
  gerado_em: string;
}

export default function ApresentacaoRelatorio() {
  const { link_hash } = useParams();
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Buscar relatório por link_hash
  useEffect(() => {
    async function fetchRelatorio() {
      const { data: relData, error } = await supabase
        .from('relatorios_benchmark')
        .select('titulo, relatorio_markdown, cliente_analise, cliente_id, versao, gerado_em')
        .eq('link_hash', link_hash)
        .eq('is_ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar relatório:', error);
        setLoading(false);
        return;
      }

      // Buscar dados de onboarding se disponível
      if (relData?.cliente_id) {
        const { data: onboardingData } = await supabase
          .from('cliente_onboarding')
          .select('*')
          .eq('cliente_id', relData.cliente_id)
          .maybeSingle();

        setRelatorio({ ...relData, cliente_onboarding: onboardingData });
      } else {
        setRelatorio(relData);
      }
      
      setLoading(false);
    }

    fetchRelatorio();
  }, [link_hash]);

  // Parsear markdown em seções
  const secoes = relatorio?.relatorio_markdown.split(/(?=^## )/gm).filter(s => s.trim()) || [];
  
  // Criar seções visuais especiais
  const renderSecaoEspecial = (secao: string, idx: number) => {
    const titulo = secao.match(/^## (.+)/)?.[1] || '';
    
    // Seção de Resumo Executivo com highlights
    if (titulo.includes('Resumo Executivo') || titulo.includes('Executivo')) {
      const highlights = [
        { label: 'Seguidores', valor: relatorio?.cliente_analise?.followers || 1250, unidade: '', tendencia: 'up' as const, icone: 'users' as const, cor: 'from-blue-500/20 to-blue-600/20' },
        { label: 'Taxa Engajamento', valor: relatorio?.cliente_analise?.engagement_rate || 3.8, unidade: '%', tendencia: 'up' as const, icone: 'trending' as const, cor: 'from-green-500/20 to-green-600/20' },
        { label: 'Posts/Mês', valor: 12, unidade: '', tendencia: 'neutral' as const, icone: 'calendar' as const, cor: 'from-purple-500/20 to-purple-600/20' },
        { label: 'Meta Atual', valor: 75, unidade: '%', tendencia: 'up' as const, icone: 'target' as const, cor: 'from-yellow-500/20 to-yellow-600/20' },
        { label: 'Concorrentes', valor: 3, unidade: '', tendencia: 'neutral' as const, icone: 'users' as const, cor: 'from-pink-500/20 to-pink-600/20' },
        { label: 'Score SWOT', valor: 85, unidade: '/100', tendencia: 'up' as const, icone: 'zap' as const, cor: 'from-orange-500/20 to-orange-600/20' }
      ];
      
      return (
        <div key={idx} className="space-y-8">
          <HighlightsNumericos highlights={highlights} />
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{secao}</ReactMarkdown>
          </div>
        </div>
      );
    }
    
    // Seção SWOT com radar chart
    if (titulo.includes('SWOT') && relatorio?.cliente_onboarding) {
      return (
        <div key={idx} className="space-y-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{secao}</ReactMarkdown>
          </div>
          <SWOTRadarChart swotData={relatorio.cliente_onboarding} />
        </div>
      );
    }
    
    // Seção de Análise Comparativa com gráficos
    if (titulo.includes('Análise Comparativa') || titulo.includes('Comparativa')) {
      const metricas = [
        {
          nome: 'Audiência',
          cliente: relatorio?.cliente_analise?.followers || 0,
          mediaConcorrentes: 5000,
          status: 'neutro' as const
        },
        {
          nome: 'Engajamento',
          cliente: relatorio?.cliente_analise?.engagement_rate || 0,
          mediaConcorrentes: 3.5,
          status: 'forte' as const
        },
        {
          nome: 'Posts/Semana',
          cliente: 4,
          mediaConcorrentes: 6,
          status: 'vulneravel' as const
        }
      ];
      
      return (
        <div key={idx} className="space-y-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{secao}</ReactMarkdown>
          </div>
          <ComparativoMetricas metricas={metricas} />
        </div>
      );
    }
    
    // Seção de Plano de Ação com timeline
    if (titulo.includes('Plano de Ação') || titulo.includes('90 dias')) {
      const fases = [
        {
          titulo: 'Fundação e Imediatos',
          periodo: 'Semana 1-4',
          acoes: [
            { titulo: 'Otimizar perfil', descricao: 'Bio, destaques e link', prazo: '48h', status: 'em_andamento' as const },
            { titulo: 'Definir pilares de conteúdo', descricao: 'Baseado em valores da marca', prazo: '1 semana', status: 'pendente' as const },
            { titulo: 'Criar calendário editorial', descricao: '30 dias de posts planejados', prazo: '2 semanas', status: 'pendente' as const }
          ]
        },
        {
          titulo: 'Aceleração',
          periodo: 'Semana 5-8',
          acoes: [
            { titulo: 'Implementar frequência ideal', descricao: 'Posts diários ou 3x/semana', prazo: '4 semanas', status: 'pendente' as const },
            { titulo: 'Testar formatos vencedores', descricao: 'Reels, carrosséis, stories', prazo: '6 semanas', status: 'pendente' as const }
          ]
        },
        {
          titulo: 'Consolidação',
          periodo: 'Semana 9-12',
          acoes: [
            { titulo: 'Analisar performance', descricao: 'Métricas e ajustes', prazo: '10 semanas', status: 'pendente' as const },
            { titulo: 'Escalar estratégia', descricao: 'Expansão baseada em resultados', prazo: '12 semanas', status: 'pendente' as const }
          ]
        }
      ];
      
      return (
        <div key={idx} className="space-y-6">
          <TimelineAcoes fases={fases} />
        </div>
      );
    }
    
    // Seções com cards coloridos baseados em tipo
    const cardClass = titulo.includes('Forças') || titulo.includes('Oportunidades') 
      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
      : titulo.includes('Fraquezas') || titulo.includes('Atenção')
      ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      : titulo.includes('Ameaças') || titulo.includes('Riscos')
      ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/30'
      : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20';
    
    return (
      <div key={idx} className={`p-6 rounded-lg border-2 ${cardClass}`}>
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300">
          <ReactMarkdown>{secao}</ReactMarkdown>
        </div>
      </div>
    );
  };

  // Navegação entre seções
  const nextSection = () => {
    if (currentSection < secoes.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    const element = document.querySelector('.apresentacao-content');
    if (!element) return;

    const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`relatorio-benchmark-v${relatorio?.versao}.pdf`);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSection();
      if (e.key === 'ArrowLeft') prevSection();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection, secoes.length]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Relatório não encontrado</h1>
          <p className="text-gray-400">O link pode estar inválido ou o relatório foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative">
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
            BEX
          </div>
          <div>
            <h1 className="text-xl font-bold">{relatorio.titulo}</h1>
            <p className="text-sm text-gray-400">
              Versão {relatorio.versao} • {new Date(relatorio.gerado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Download className="h-5 w-5" />
          </Button>
          <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Conteúdo da apresentação */}
      <div className="apresentacao-content h-full flex items-center justify-center px-8 py-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="max-w-6xl w-full"
          >
            {/* Capa especial para primeira seção */}
            {currentSection === 0 && secoes[0]?.includes('# 📊') && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
                    Relatório Estratégico
                  </h1>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {relatorio?.titulo?.replace('Relatório de Benchmark Digital - ', '')}
                  </h2>
                  <p className="text-xl text-gray-400">
                    Versão {relatorio?.versao} • {new Date(relatorio?.gerado_em || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex gap-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Análise SWOT Completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span>Plano 90 Dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                    <span>Benchmark Competitivo</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 max-w-2xl">
                  Relatório gerado pela BEX Intelligence combinando análise de concorrentes, 
                  onboarding estratégico e metas ativas do sistema.
                </p>
              </motion.div>
            )}
            
            {/* Seções normais com renderização especial */}
            {currentSection > 0 && secoes[currentSection] && renderSecaoEspecial(secoes[currentSection], currentSection)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegação inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <Button 
          onClick={prevSection} 
          disabled={currentSection === 0} 
          variant="ghost"
          className="text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Anterior
        </Button>
        
        <div className="flex gap-2 items-center">
          {secoes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSection(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSection 
                  ? 'bg-blue-500 w-8' 
                  : 'bg-gray-500/50 w-2 hover:bg-gray-400'
              }`}
              aria-label={`Ir para seção ${i + 1}`}
            />
          ))}
        </div>
        
        <Button 
          onClick={nextSection} 
          disabled={currentSection === secoes.length - 1} 
          variant="ghost"
          className="text-white hover:bg-white/10 disabled:opacity-30"
        >
          Próximo
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Marca d'água */}
      <div className="absolute bottom-6 right-6 text-xs text-gray-600 select-none">
        Powered by BEX Intelligence
      </div>

      {/* Indicador de seção atual */}
      <div className="absolute top-24 right-6 text-sm text-gray-500">
        {currentSection + 1} / {secoes.length}
      </div>
    </div>
  );
}
