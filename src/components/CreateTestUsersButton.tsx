import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { toast } from "sonner";

export function CreateTestUsersButton() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    
    try {
      const results = await createTestUsers();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        toast.success(`✅ ${successful} usuários criados com sucesso!`);
      }
      
      if (failed > 0) {
        toast.error(`❌ ${failed} usuários falharam na criação`);
      }
      
      console.log('📊 Resultados:', results);
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error("Erro ao criar usuários de teste");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateUsers}
      disabled={isCreating}
      variant="outline"
      className="w-full"
    >
      {isCreating ? "Criando usuários..." : "Criar Usuários de Teste"}
    </Button>
  );
}