import { DatabaseHealthCheck } from '@/components/Admin/DatabaseHealthCheck';
import { SectionHeader } from '@/components/SectionHeader';
import { useEffect } from 'react';

const SystemHealth = () => {
  useEffect(() => {
    document.title = 'Saúde do Sistema | BEX';
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Saúde do Sistema"
        description="Monitoramento de integridade do banco de dados e usuários"
      />
      
      <DatabaseHealthCheck />
    </div>
  );
};

export default SystemHealth;
