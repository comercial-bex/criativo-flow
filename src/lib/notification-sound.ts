// Som de notificação usando Web Audio API
export const playNotificationSound = () => {
  try {
    // Criar contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Criar oscilador para um som suave de notificação
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar som (frequência e volume)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Tocar som
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Som de notificação bloqueado ou não suportado:', error);
  }
};
