import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Lock, User, Phone, FileText, Building, Eye, EyeOff } from 'lucide-react';
import LoginPage from '@/components/ui/gaming-login';
import { useSignUpWithValidation, ValidationResult } from '@/hooks/useSignUpWithValidation';
import { smartToast } from '@/lib/smart-toast';

const signUpSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  empresa: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const { validateSignUp, processSignUp, isValidating } = useSignUpWithValidation();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    empresa: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Limpar validação anterior
    setValidationResult(null);
  };

  const handleValidate = async () => {
    try {
      // Validar schema
      const validated = signUpSchema.parse(formData);
      setErrors({});

      // Validar com banco
      const result = await validateSignUp({
        nome: validated.nome,
        email: validated.email,
        cpf: validated.cpf,
        telefone: validated.telefone,
        password: validated.password,
        empresa: validated.empresa,
      });

      setValidationResult(result);

      if (!result.canProceed) {
        smartToast.error('Atenção', result.message);
      } else {
        smartToast.info('Validação OK', result.message);
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignUpFormData;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult) {
      await handleValidate();
      return;
    }

    if (!validationResult.canProceed) {
      smartToast.error('Não é possível prosseguir', validationResult.message);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processSignUp({
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        password: formData.password,
        empresa: formData.empresa,
      }, validationResult);

      if (result.success) {
        // Redirecionar para página de confirmação
        navigate('/auth', { 
          state: { 
            message: 'Cadastro realizado! Verifique seu email para confirmar.' 
          } 
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <LoginPage.VideoBackground 
        imageUrl="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1920&h=1080&fit=crop"
      />
      
      <div className="relative z-20 w-full max-w-md">
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold mb-2 relative group">
              <span className="absolute -inset-1 bg-gradient-to-r from-[#54C43D]/30 via-[#6dd34f]/30 to-[#47a834]/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500"></span>
              <span className="relative inline-block text-3xl font-bold text-white">
                BEX
              </span>
            </h2>
            <p className="text-white/80 text-sm">
              Crie sua conta e aguarde aprovação
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="text-white/60" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Nome completo *"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="text-white/60" size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* CPF */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <FileText className="text-white/60" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="CPF (opcional)"
                  value={formData.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Phone className="text-white/60" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Telefone (opcional)"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Building className="text-white/60" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Empresa (opcional)"
                  value={formData.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="text-white/60" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha *"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="text-white/60" size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar senha *"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Mensagem de Validação */}
            {validationResult && (
              <div className={`p-3 rounded-lg text-sm ${
                validationResult.canProceed 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
              }`}>
                {validationResult.message}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              {!validationResult && (
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50"
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </button>
              )}
              
              <button
                type="submit"
                disabled={!validationResult || !validationResult.canProceed || isProcessing}
                className="flex-1 py-3 rounded-lg bg-[#54C43D] hover:bg-[#47a834] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#54C43D]/20 hover:shadow-[#54C43D]/40"
              >
                {isProcessing ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </div>
          </form>

          {/* Link para Login */}
          <p className="mt-6 text-center text-sm text-white/60">
            Já tem uma conta?{' '}
            <a href="/auth" className="font-medium text-white hover:text-[#54C43D] transition-colors">
              Fazer Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
