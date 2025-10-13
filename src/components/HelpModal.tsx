import { useState, useEffect } from "react";
import { HelpCircle, Search, MessageSquare, Book, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  tags: string[];
}

const categoryColors = {
  geral: 'bg-gray-100 text-gray-800',
  crm: 'bg-blue-100 text-blue-800',
  audiovisual: 'bg-orange-100 text-orange-800',
  projetos: 'bg-green-100 text-green-800',
  financeiro: 'bg-purple-100 text-purple-800'
};

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [filteredFAQ, setFilteredFAQ] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchFAQ = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq_suporte')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setFaqItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar FAQ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFAQ();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = faqItems;

    // Filter by category
    if (selectedCategory !== "todas") {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    // Filter by search term
    if (debouncedSearch) {
      filtered = filtered.filter(item =>
        item.pergunta.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.resposta.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    setFilteredFAQ(filtered);
  }, [faqItems, selectedCategory, debouncedSearch]);

  const categories = [...new Set(faqItems.map(item => item.categoria))];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Central de Ajuda">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent size="2xl" height="xl">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Central de Ajuda</DialogTitle>
          <DialogDescription>
            Encontre respostas para suas dúvidas e aprenda a usar o sistema
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">
              <Book className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <MessageSquare className="h-4 w-4 mr-2" />
              Tutoriais
            </TabsTrigger>
            <TabsTrigger value="support">
              <HelpCircle className="h-4 w-4 mr-2" />
              Suporte
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nas perguntas frequentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "todas" ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("todas")}
                >
                  Todas
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer ${selectedCategory === category ? '' : categoryColors[category as keyof typeof categoryColors]}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* FAQ Items */}
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredFAQ.length > 0 ? (
                <div className="space-y-3">
                  {filteredFAQ.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm">{item.pergunta}</CardTitle>
                          <Badge 
                            variant="secondary"
                            className={categoryColors[item.categoria as keyof typeof categoryColors]}
                          >
                            {item.categoria}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.resposta}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma pergunta encontrada</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="tutorials" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Tutoriais em desenvolvimento</p>
              <p className="text-sm">Em breve, teremos tutoriais interativos disponíveis</p>
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contato Direto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Para suporte técnico, entre em contato conosco:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Email:</strong> suporte@agencia.com</p>
                      <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
                      <p><strong>Horário:</strong> Segunda a Sexta, 9h às 18h</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Ticket de Suporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}