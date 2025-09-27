import { Button } from "@/components/ui/button";
import { Facebook, Mail, Instagram } from "lucide-react";
import { useSocialAuth } from "@/hooks/useSocialAuth";

interface SocialLoginButtonsProps {
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const { loading, signInWithProvider } = useSocialAuth();

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-3 hover:bg-blue-50 border-blue-200"
        onClick={() => signInWithProvider('facebook')}
        disabled={loading}
      >
        <Facebook className="h-5 w-5 text-blue-600" />
        {loading ? 'Conectando...' : 'Entrar com Facebook'}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-3 hover:bg-red-50 border-red-200"
        onClick={() => signInWithProvider('google')}
        disabled={loading}
      >
        <Mail className="h-5 w-5 text-red-600" />
        {loading ? 'Conectando...' : 'Entrar com Google'}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-3 hover:bg-purple-50 border-purple-200"
        onClick={() => signInWithProvider('instagram')}
        disabled={loading}
      >
        <Instagram className="h-5 w-5 text-purple-600" />
        {loading ? 'Conectando...' : 'Entrar com Instagram'}
      </Button>
    </div>
  );
}