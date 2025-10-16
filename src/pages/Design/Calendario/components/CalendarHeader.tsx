import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile, ViewMode } from '../types';
import { formatDate } from '../utils/dateHelpers';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  filtroDesigner: string;
  onFilterChange: (value: string) => void;
  profiles: Profile[];
}

export const CalendarHeader = ({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  filtroDesigner,
  onFilterChange,
  profiles
}: CalendarHeaderProps) => {
  const getTitle = () => {
    switch (viewMode) {
      case 'month':
        return formatDate(currentDate, 'MMMM yyyy');
      case 'week':
        return `Semana de ${formatDate(currentDate, 'dd/MM/yyyy')}`;
      case 'day':
        return formatDate(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy");
      default:
        return formatDate(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[200px] text-center">
          <h2 className="text-xl font-semibold capitalize">{getTitle()}</h2>
        </div>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Hoje
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select value={filtroDesigner} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar designer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os designers</SelectItem>
            {profiles
              .filter(p => p.id)
              .map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.nome}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
