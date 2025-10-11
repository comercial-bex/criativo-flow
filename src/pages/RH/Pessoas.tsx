import { Layout } from '@/components/Layout';
import { PessoasManager } from '@/components/RH/PessoasManager';

export default function Pessoas() {
  return (
    <Layout>
      <div className="p-6">
        <PessoasManager />
      </div>
    </Layout>
  );
}
