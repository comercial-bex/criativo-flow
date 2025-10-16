import { useState } from 'react';
import { ViewMode } from '../types';

export const useViewMode = (initialMode: ViewMode = 'month') => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  return {
    viewMode,
    setViewMode,
    isMonthView: viewMode === 'month',
    isWeekView: viewMode === 'week',
    isListView: viewMode === 'list',
    isDayView: viewMode === 'day'
  };
};
