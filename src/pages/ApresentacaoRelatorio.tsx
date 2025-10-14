import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Maximize, ChevronLeft, ChevronRight, Minimize } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RelatorioData {
  titulo: string;
  relatorio_markdown: string;
  cliente_analise: any;
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
      const { data, error } = await supabase
        .from('relatorios_benchmark')
        .select('titulo, relatorio_markdown, cliente_analise, versao, gerado_em')
        .eq('link_hash', link_hash)
        .eq('is_ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar relatório:', error);
      } else {
        setRelatorio(data);
      }
      setLoading(false);
    }

    fetchRelatorio();
  }, [link_hash]);

  // Parsear markdown em seções
  const secoes = relatorio?.relatorio_markdown.split(/(?=^## )/gm).filter(s => s.trim()) || [];

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
      <div className="apresentacao-content h-full flex items-center justify-center px-8 py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="max-w-5xl w-full"
          >
            {secoes[currentSection] && (
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300">
                <ReactMarkdown>{secoes[currentSection]}</ReactMarkdown>
              </div>
            )}
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
