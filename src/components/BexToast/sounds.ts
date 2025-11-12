/**
 * Sistema de Sons de Notificação para Toasts
 * Usa Web Audio API para gerar sons sintetizados
 */

import { ToastVariant, ToastPriority } from "./types";

class ToastSoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3; // Volume padrão (0 a 1)

  constructor() {
    // Lazy initialization do AudioContext
    if (typeof window !== "undefined") {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API não suportada neste navegador");
    }
  }

  // Garantir que o AudioContext está pronto
  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    // Resume AudioContext se estiver suspenso (comum após user gesture)
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Gera um tom simples
   */
  private async playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    detune: number = 0
  ) {
    if (!this.enabled || !this.audioContext) return;

    await this.ensureAudioContext();

    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    oscillator.detune.value = detune;

    // Envelope ADSR para som mais natural
    const now = this.audioContext!.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.05); // Decay
    gainNode.gain.setValueAtTime(this.volume * 0.7, now + duration - 0.05); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Som de sucesso - Duas notas ascendentes (C5 -> E5)
   */
  private async playSuccessSound() {
    await this.playTone(523.25, 0.1, "sine"); // C5
    setTimeout(() => this.playTone(659.25, 0.15, "sine"), 80); // E5
  }

  /**
   * Som de erro - Tom descendente dramático
   */
  private async playErrorSound() {
    await this.playTone(392, 0.15, "triangle"); // G4
    setTimeout(() => this.playTone(330, 0.2, "triangle"), 100); // E4
  }

  /**
   * Som de warning - Tom médio com vibrato
   */
  private async playWarningSound() {
    await this.playTone(440, 0.12, "square", 10); // A4 com leve detune
    setTimeout(() => this.playTone(440, 0.12, "square", -10), 100);
  }

  /**
   * Som de info - Tom suave e curto
   */
  private async playInfoSound() {
    await this.playTone(587.33, 0.08, "sine"); // D5
  }

  /**
   * Som crítico - Sequência de alertas urgentes
   */
  private async playCriticalSound() {
    // Padrão de alarme: beep-beep-beep rápido
    await this.playTone(880, 0.08, "square"); // A5
    setTimeout(() => this.playTone(880, 0.08, "square"), 90);
    setTimeout(() => this.playTone(880, 0.12, "square"), 180);
  }

  /**
   * Toca o som apropriado baseado na variante e prioridade
   */
  async play(variant?: ToastVariant, priority?: ToastPriority) {
    if (!this.enabled) return;

    // Prioridade crítica tem som próprio
    if (priority === "critical") {
      await this.playCriticalSound();
      return;
    }

    // Sons baseados na variante
    switch (variant) {
      case "success":
        await this.playSuccessSound();
        break;
      case "error":
        await this.playErrorSound();
        break;
      case "warning":
        await this.playWarningSound();
        break;
      case "info":
      case "default":
      default:
        await this.playInfoSound();
        break;
    }
  }

  /**
   * Habilita ou desabilita sons
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    
    // Salvar preferência no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("bex-toast-sounds-enabled", String(enabled));
    }
  }

  /**
   * Define o volume (0 a 1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Salvar preferência no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("bex-toast-sounds-volume", String(this.volume));
    }
  }

  /**
   * Retorna se os sons estão habilitados
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Retorna o volume atual
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Carrega preferências salvas
   */
  loadPreferences() {
    if (typeof window === "undefined") return;

    const savedEnabled = localStorage.getItem("bex-toast-sounds-enabled");
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === "true";
    }

    const savedVolume = localStorage.getItem("bex-toast-sounds-volume");
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }

  /**
   * Testa o som (útil para configurações)
   */
  async testSound(variant: ToastVariant = "info") {
    const wasEnabled = this.enabled;
    this.enabled = true;
    await this.play(variant);
    this.enabled = wasEnabled;
  }
}

// Instância singleton
export const toastSoundManager = new ToastSoundManager();

// Carregar preferências ao inicializar
if (typeof window !== "undefined") {
  toastSoundManager.loadPreferences();
}
