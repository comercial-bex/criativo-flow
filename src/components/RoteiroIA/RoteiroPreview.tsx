import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface RoteiroPreviewProps {
  roteiro: string;
  metadata: {
    cliente: string;
    titulo: string;
    duracao: number;
    objetivo: string;
    tom: string;
    agencia?: string;
    produtora?: string;
    data?: string;
  };
  logoUrl?: string;
  onMetadataChange?: (field: string, value: any) => void;
  editable?: boolean;
}

export default function RoteiroPreview({ 
  roteiro, 
  metadata, 
  logoUrl, 
  onMetadataChange,
  editable = false 
}: RoteiroPreviewProps) {
  
  const parseRoteiroWithColors = (markdown: string) => {
    if (!markdown) return [];
    
    const lines = markdown.split('\n');
    
    return lines.map((line, idx) => {
      const trimmedLine = line.trim();
      
      // 🟣 Roxo - CENA X
      if (/^CENA\s+\d+/i.test(trimmedLine) || /^###\s+CENA/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500 p-3 my-2 rounded font-bold text-purple-900 dark:text-purple-200">
            {trimmedLine.replace(/^###\s+/, '')}
          </div>
        );
      }
      
      // 🟠 Laranja - Locução em ON
      if (/Locução em ON:|em plano|cenário|personagem fala/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 p-2 my-1 rounded text-orange-900 dark:text-orange-200">
            {trimmedLine}
          </div>
        );
      }
      
      // 🟡 Amarelo - Locução em OFF / Descrições visuais
      if (/Locução em OFF:|Imagens de|Abertura com|descrição:/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-2 my-1 rounded text-yellow-900 dark:text-yellow-200">
            {trimmedLine}
          </div>
        );
      }
      
      // 🔴 Vermelho - Tela final / CTA / Hashtags
      if (/Tela final|CTA:|hashtag|#\w+|call.to.action/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-2 my-1 rounded font-semibold text-red-900 dark:text-red-200">
            {trimmedLine}
          </div>
        );
      }
      
      // 🩵 Turquesa - Tom/Emoção
      if (/tom:|emoção:|sensação:|clima:/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-cyan-100 dark:bg-cyan-900/30 border-l-4 border-cyan-500 p-2 my-1 rounded italic text-cyan-900 dark:text-cyan-200">
            {trimmedLine}
          </div>
        );
      }
      
      // ⚫ Cinza - Observações técnicas (entre parênteses ou keywords)
      if (/\(.*\)|plano:|câmera:|luz:|som:|trilha:|tempo:/i.test(trimmedLine)) {
        return (
          <div key={idx} className="bg-gray-100 dark:bg-gray-800/30 border-l-2 border-gray-400 p-2 my-1 rounded text-gray-700 dark:text-gray-400 text-sm italic">
            {trimmedLine}
          </div>
        );
      }
      
      // Headers markdown
      if (trimmedLine.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold my-3">{trimmedLine.replace('# ', '')}</h1>;
      }
      if (trimmedLine.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold my-2">{trimmedLine.replace('## ', '')}</h2>;
      }
      
      // Separadores
      if (trimmedLine.startsWith('---')) {
        return <hr key={idx} className="my-4 border-muted" />;
      }
      
      // Lista
      if (trimmedLine.startsWith('- ')) {
        return <li key={idx} className="ml-4 my-1">{trimmedLine.replace('- ', '• ')}</li>;
      }
      
      // Texto normal
      if (trimmedLine) {
        return <p key={idx} className="py-1 leading-relaxed">{trimmedLine}</p>;
      }
      
      // Linha vazia
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="space-y-4">
      {/* 🔵 Cabeçalho Azul */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 w-auto max-w-[150px] object-contain mb-2" 
                />
              )}
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                🎬 {metadata.titulo}
              </h2>
            </div>
          </div>
          
          {/* Tabela de Informações Técnicas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-800 dark:text-blue-300">Cliente:</span>
              {editable && onMetadataChange ? (
                <Input 
                  value={metadata.cliente} 
                  onChange={(e) => onMetadataChange('cliente', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-blue-900 dark:text-blue-200">{metadata.cliente}</p>
              )}
            </div>
            
            <div>
              <span className="font-semibold text-blue-800 dark:text-blue-300">Agência:</span>
              {editable && onMetadataChange ? (
                <Input 
                  value={metadata.agencia || "BEX Communication"} 
                  onChange={(e) => onMetadataChange('agencia', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-blue-900 dark:text-blue-200">{metadata.agencia || "BEX Communication"}</p>
              )}
            </div>
            
            <div>
              <span className="font-semibold text-blue-800 dark:text-blue-300">Peça:</span>
              <p className="text-blue-900 dark:text-blue-200">{metadata.duracao}s</p>
            </div>
            
            <div>
              <span className="font-semibold text-blue-800 dark:text-blue-300">Produtora:</span>
              {editable && onMetadataChange ? (
                <Input 
                  value={metadata.produtora || "INSPIRE FILMES"} 
                  onChange={(e) => onMetadataChange('produtora', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-blue-900 dark:text-blue-200">{metadata.produtora || "INSPIRE FILMES"}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <span className="font-semibold text-blue-800 dark:text-blue-300">Data:</span>
              <p className="text-blue-900 dark:text-blue-200">{metadata.data || new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 🟢 Verde - Contexto */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4">
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-green-800 dark:text-green-300">🎯 Objetivo:</span>
            <p className="text-green-900 dark:text-green-200 mt-1">{metadata.objetivo}</p>
          </div>
          <div>
            <span className="font-semibold text-green-800 dark:text-green-300">🎭 Tom:</span>
            <p className="text-green-900 dark:text-green-200 mt-1">{metadata.tom}</p>
          </div>
        </div>
      </Card>

      {/* Roteiro com Cores */}
      <Card className="p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {parseRoteiroWithColors(roteiro)}
        </div>
      </Card>
    </div>
  );
}
