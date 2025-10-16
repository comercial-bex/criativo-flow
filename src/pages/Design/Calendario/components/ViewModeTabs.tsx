import { Calendar, CalendarDays, List, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewMode } from '../types';

interface ViewModeTabsProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewModeTabs = ({ value, onChange }: ViewModeTabsProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewMode)} className="w-auto">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="month" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Mês</span>
        </TabsTrigger>
        <TabsTrigger value="week" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Semana</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Lista</span>
        </TabsTrigger>
        <TabsTrigger value="day" className="gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Dia</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
