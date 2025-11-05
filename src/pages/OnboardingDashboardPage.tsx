import { SectionHeader } from '@/components/SectionHeader';
import { OnboardingDashboard } from '@/components/OnboardingDashboard';
import { BarChart3 } from 'lucide-react';

export default function OnboardingDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        title="Dashboard de Onboarding"
        description="Acompanhe o progresso do onboarding de todos os clientes"
        icon={BarChart3}
      />
      
      <OnboardingDashboard />
    </div>
  );
}
