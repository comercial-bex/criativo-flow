import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalState {
  templateSelector: boolean;
  agendamento: boolean;
  previsao: boolean;
  publicacao: boolean;
  abTesting: boolean;
  textoEstruturado: boolean;
}

interface PlanoEditorialModalsContextType {
  modals: ModalState;
  activePostId: string | null;
  openModal: (modal: keyof ModalState, postId?: string) => void;
  closeModal: (modal: keyof ModalState) => void;
  closeAll: () => void;
}

const PlanoEditorialModalsContext = createContext<PlanoEditorialModalsContextType | undefined>(undefined);

const initialModalState: ModalState = {
  templateSelector: false,
  agendamento: false,
  previsao: false,
  publicacao: false,
  abTesting: false,
  textoEstruturado: false,
};

export function PlanoEditorialModalsProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalState>(initialModalState);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const openModal = (modal: keyof ModalState, postId?: string) => {
    // Fechar todos os modais antes de abrir um novo
    setModals({ ...initialModalState, [modal]: true });
    if (postId) setActivePostId(postId);
  };

  const closeModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const closeAll = () => {
    setModals(initialModalState);
    setActivePostId(null);
  };

  return (
    <PlanoEditorialModalsContext.Provider value={{ modals, activePostId, openModal, closeModal, closeAll }}>
      {children}
    </PlanoEditorialModalsContext.Provider>
  );
}

export function usePlanoEditorialModals() {
  const context = useContext(PlanoEditorialModalsContext);
  if (!context) {
    throw new Error('usePlanoEditorialModals must be used within PlanoEditorialModalsProvider');
  }
  return context;
}
