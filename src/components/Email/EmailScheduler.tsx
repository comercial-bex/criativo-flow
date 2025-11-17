import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailSchedulerProps {
  onScheduleChange: (date: Date | null) => void;
  initialDate?: Date;
}

export function EmailScheduler({ onScheduleChange, initialDate }: EmailSchedulerProps) {
  const [mode, setMode] = useState<'now' | 'schedule'>('now');
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [selectedHour, setSelectedHour] = useState<string>('09');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');

  const handleModeChange = (newMode: 'now' | 'schedule') => {
    setMode(newMode);
    if (newMode === 'now') {
      onScheduleChange(null);
    } else {
      updateScheduledDate(selectedDate, selectedHour, selectedMinute);
    }
  };

  const updateScheduledDate = (date: Date, hour: string, minute: string) => {
    const scheduledDate = setMinutes(setHours(date, parseInt(hour)), parseInt(minute));
    setSelectedDate(scheduledDate);
    onScheduleChange(scheduledDate);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateScheduledDate(date, selectedHour, selectedMinute);
    }
  };

  const handleQuickSelect = (days: number, hour: number) => {
    const quickDate = addHours(addDays(new Date(), days), hour - new Date().getHours());
    const finalDate = setMinutes(quickDate, 0);
    setSelectedDate(finalDate);
    setSelectedHour(hour.toString().padStart(2, '0'));
    setSelectedMinute('00');
    setMode('schedule');
    onScheduleChange(finalDate);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const timeUntilSend = mode === 'schedule' ? (() => {
    const now = new Date();
    const scheduled = setMinutes(setHours(selectedDate, parseInt(selectedHour)), parseInt(selectedMinute));
    const diff = scheduled.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `em ${days}d ${hours}h`;
    if (hours > 0) return `em ${hours}h ${minutes}min`;
    return `em ${minutes} minutos`;
  })() : null;

  return (
    <div className="space-y-4">
      <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as any)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="now" id="now" />
          <Label htmlFor="now" className="font-normal cursor-pointer">
            Enviar agora
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="schedule" id="schedule" />
          <Label htmlFor="schedule" className="font-normal cursor-pointer">
            Agendar envio
          </Label>
        </div>
      </RadioGroup>

      {mode === 'schedule' && (
        <div className="space-y-4">
          {/* Sugestões rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(1, 9)}
            >
              Amanhã às 9h
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(1, 14)}
            >
              Amanhã às 14h
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(7, 9)}
            >
              Próxima semana
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(0, new Date().getHours() + 2)}
            >
              Daqui a 2 horas
            </Button>
          </div>

          {/* Seleção de data e hora */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Label>Data e Horário</Label>
            </div>

            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date()}
                locale={ptBR}
                className="rounded-md border"
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Hora</Label>
                  <Select value={selectedHour} onValueChange={(v) => {
                    setSelectedHour(v);
                    updateScheduledDate(selectedDate, v, selectedMinute);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(h => (
                        <SelectItem key={h} value={h}>{h}h</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Minuto</Label>
                  <Select value={selectedMinute} onValueChange={(v) => {
                    setSelectedMinute(v);
                    updateScheduledDate(selectedDate, selectedHour, v);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(m => (
                        <SelectItem key={m} value={m}>{m}min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Preview do agendamento */}
          {timeUntilSend && (
            <Card className="p-3 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">
                    Email será enviado {timeUntilSend}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      setMinutes(setHours(selectedDate, parseInt(selectedHour)), parseInt(selectedMinute)),
                      "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
