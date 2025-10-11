import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Building } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function CRMContatos() {
  const { data: clientes, isLoading } = useQuery({
    queryKey: ['crm-contatos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email, telefone')
        .eq('status', 'ativo')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Phone className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Contatos CRM</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Lista de Contatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando contatos...</p>
            ) : (
              <div className="space-y-4">
                {clientes?.map((cliente) => (
                  <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {cliente.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {cliente.email}
                          </span>
                        )}
                        {cliente.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {cliente.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {cliente.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${cliente.email}`}>Email</a>
                        </Button>
                      )}
                      {cliente.telefone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
