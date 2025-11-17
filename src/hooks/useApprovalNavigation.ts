import { useState, useCallback } from 'react';
import { ClientApprovalWithDetails } from './useClientApprovals';

export function useApprovalNavigation(approvals: ClientApprovalWithDetails[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextApproval = useCallback(() => {
    if (currentIndex < approvals.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, approvals.length]);

  const previousApproval = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToApproval = useCallback((index: number) => {
    if (index >= 0 && index < approvals.length) {
      setCurrentIndex(index);
    }
  }, [approvals.length]);

  return {
    currentIndex,
    currentApproval: approvals[currentIndex],
    nextApproval,
    previousApproval,
    goToApproval,
    hasNext: currentIndex < approvals.length - 1,
    hasPrevious: currentIndex > 0,
    total: approvals.length,
  };
}
