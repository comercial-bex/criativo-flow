'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome, Twitter, Gamepad2 } from 'lucide-react';

interface LoginFormProps {
    onSubmit: (email: string, password: string, remember: boolean) => void;
    onForgotPassword?: () => void;
    loading?: boolean;
}

interface VideoBackgroundProps {
    videoUrl?: string;
    imageUrl?: string;
}

interface FormInputProps {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

interface SocialButtonProps {
    icon: React.ReactNode;
    name: string;
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    id: string;
}

// FormInput Component
const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
        </div>
    );
};

// SocialButton Component
const SocialButton: React.FC<SocialButtonProps> = ({ icon }) => {
    return (
        <button className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            {icon}
        </button>
    );
};

// ToggleSwitch Component
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
    return (
        <div className="relative inline-block w-10 h-5 cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-purple-600' : 'bg-white/20'}`}>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-5' : ''}`} />
            </div>
        </div>
    );
};

// VideoBackground Component
const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl, imageUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video && videoUrl && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.load();
                        observer.disconnect();
                    }
                });
            });
            observer.observe(video);
            return () => observer.disconnect();
        }
    }, [videoUrl]);

    // Play vídeo apenas APÓS interação ou 2s (melhora LCP)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        
        const startVideo = () => {
            video.play().catch(err => console.log('Video autoplay prevented:', err));
        };
        
        // Opção 1: Após 2s (garante LCP primeiro)
        const timer = setTimeout(startVideo, 2000);
        
        // Opção 2: Ao scroll/click
        const handleInteraction = () => {
            startVideo();
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
        
        window.addEventListener('scroll', handleInteraction, { once: true });
        window.addEventListener('click', handleInteraction, { once: true });
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-black/50 z-10" />
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : videoUrl ? (
                <video
                    ref={videoRef}
                    className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
                    poster="/logo-bex.png"
                    loop
                    muted
                    playsInline
                    preload="none"
                    style={{ willChange: 'opacity' }}
                    onError={(e) => {
                        console.warn('Erro ao carregar vídeo de fundo');
                        e.currentTarget.style.display = 'none';
                    }}
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
            ) : null}
        </div>
    );
};

// Main LoginForm Component
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword, loading = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password, remember);
    };

    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-4 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-[#54C43D]/30 via-[#6dd34f]/30 to-[#47a834]/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500"></span>
                    <span className="relative inline-block text-3xl font-bold text-white">
                        BEX
                    </span>
                </h2>
                <p className="text-white/80">
                    Faça login em sua conta
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    icon={<Mail className="text-white/60" size={18} />}
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="relative">
                    <FormInput
                        icon={<Lock className="text-white/60" size={18} />}
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div onClick={() => setRemember(!remember)} className="cursor-pointer">
                            <ToggleSwitch
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                id="remember-me"
                            />
                        </div>
                        <label
                            htmlFor="remember-me"
                            className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
                            onClick={() => setRemember(!remember)}
                        >
                            Lembrar-me
                        </label>
                    </div>
                    <button 
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                        Esqueci minha senha
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-[#54C43D] hover:bg-[#47a834] text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#54C43D] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-[#54C43D]/20 hover:shadow-[#54C43D]/40"
                >
                    {loading ? 'Entrando...' : 'Prosseguir'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/60">
                Não tem uma conta?{' '}
                <a href="/signup" className="font-medium text-white hover:text-[#54C43D] transition-colors">
                    Inscrever-se
                </a>
            </p>
        </div>
    );
};

// Export as default components
const LoginPage = {
    LoginForm,
    VideoBackground
};

export default LoginPage;
