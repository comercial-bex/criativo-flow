import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ClientSelector } from "@/components/ClientSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjetos } from "@/hooks/useProjetos";
import { useTarefas } from "@/hooks/useTarefas";
import { X } from "lucide-react";

const PLATAFORMAS = [
  { value: "reels", label: "Reels", emoji: "📱" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
  { value: "short", label: "Shorts", emoji: "▶️" },
  { value: "vt", label: "VT", emoji: "📺" },
  { value: "institucional", label: "Institucional", emoji: "🏢" },
  { value: "spot_radio", label: "Spot Rádio", emoji: "🎙️" },
  { value: "doc", label: "Documentário", emoji: "🎬" },
  { value: "outro", label: "Outro", emoji: "📹" },
];

export default function Step1Briefing({ formData, setFormData }: any) {
  const [publicoInput, setPublicoInput] = useState("");
  const [pilaresInput, setPilaresInput] = useState("");
  
  const { projetos } = useProjetos();
  const { tarefas } = useTarefas();

  const filteredProjetos = projetos?.filter((p: any) => !formData.cliente_id || p.cliente_id === formData.cliente_id);
  const filteredTarefas = tarefas?.filter((t: any) => !formData.projeto_id || t.projeto_id === formData.projeto_id);

  const handleAddTag = (field: string, value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[field] || [];
    if (!currentArray.includes(value.trim())) {
      setFormData({ ...formData, [field]: [...currentArray, value.trim()] });
    }
  };

  const handleRemoveTag = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((item: string) => item !== value),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">📝 Briefing</h2>
        <p className="text-muted-foreground">Informações básicas do roteiro</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <ClientSelector
            selectedClientId={formData.cliente_id}
            onClientSelect={(value) => setFormData({ ...formData, cliente_id: value || "", projeto_id: "", tarefa_id: "" })}
            showContext={false}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projeto">Projeto *</Label>
          <Select
            value={formData.projeto_id}
            onValueChange={(value) => setFormData({ ...formData, projeto_id: value, tarefa_id: "" })}
            disabled={!formData.cliente_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {filteredProjetos?.map((projeto: any) => (
                <SelectItem key={projeto.id} value={projeto.id}>
                  {projeto.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tarefa">Tarefa (opcional)</Label>
          <Select
            value={formData.tarefa_id}
            onValueChange={(value) => setFormData({ ...formData, tarefa_id: value })}
            disabled={!formData.projeto_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma tarefa" />
            </SelectTrigger>
            <SelectContent>
              {filteredTarefas?.map((tarefa: any) => (
                <SelectItem key={tarefa.id} value={tarefa.id}>
                  {tarefa.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título do Roteiro *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Roteiro Reels - Black Friday 2024"
          />
        </div>
      </div>

      {/* Campos de Metadados Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente_nome">Nome do Cliente</Label>
          <Input
            id="cliente_nome"
            value={formData.cliente_nome || ''}
            onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
            placeholder="Ex: BEX Communication"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencia">Agência</Label>
          <Input
            id="agencia"
            value={formData.agencia || ''}
            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
            placeholder="BEX Communication"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="produtora">Produtora</Label>
          <Input
            id="produtora"
            value={formData.produtora || ''}
            onChange={(e) => setFormData({ ...formData, produtora: e.target.value })}
            placeholder="INSPIRE FILMES"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Plataforma *</Label>
        <div className="flex flex-wrap gap-2">
          {PLATAFORMAS.map((plat) => (
            <Badge
              key={plat.value}
              variant={formData.plataforma === plat.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFormData({ ...formData, plataforma: plat.value })}
            >
              {plat.emoji} {plat.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objetivo">Objetivo do Vídeo *</Label>
        <Textarea
          id="objetivo"
          value={formData.objetivo}
          onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
          placeholder="Ex: Aumentar engajamento e conversões na Black Friday"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publico">Público-alvo</Label>
        <div className="flex gap-2">
          <Input
            id="publico"
            value={publicoInput}
            onChange={(e) => setPublicoInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag("publico_alvo", publicoInput);
                setPublicoInput("");
              }
            }}
            placeholder="Digite e pressione Enter"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.publico_alvo?.map((item: string) => (
            <Badge key={item} variant="secondary">
              {item}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleRemoveTag("publico_alvo", item)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pilares">Pilares da Mensagem</Label>
        <div className="flex gap-2">
          <Input
            id="pilares"
            value={pilaresInput}
            onChange={(e) => setPilaresInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag("pilares_mensagem", pilaresInput);
                setPilaresInput("");
              }
            }}
            placeholder="Digite e pressione Enter"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.pilares_mensagem?.map((item: string) => (
            <Badge key={item} variant="secondary">
              {item}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleRemoveTag("pilares_mensagem", item)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referencias">Referências (Links, URLs)</Label>
        <Textarea
          id="referencias"
          value={formData.referencias}
          onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
          placeholder="Cole links de referências visuais, vídeos inspiradores, etc."
          rows={2}
        />
      </div>
    </div>
  );
}
