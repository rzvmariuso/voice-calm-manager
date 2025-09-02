import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Calendar, CalendarDays, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onNewAppointment: () => void;
  filters: {
    status: string;
    service: string;
    aiOnly: boolean;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
  appointmentStats: {
    total: number;
    aiBookings: number;
    thisWeek: number;
  };
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
  onNewAppointment,
  filters,
  onFiltersChange,
  appointmentStats
}: CalendarHeaderProps) {
  const formatTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: de });
    } else {
      return `${format(currentDate, 'dd.MM.yyyy', { locale: de })} - Woche`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Kalender
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {formatTitle()}
              <Badge variant="outline" className="text-xs">
                {appointmentStats.total} Termine
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('prev')}
            className="hover-scale"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToday}
            className="hover-scale"
          >
            Heute
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('next')}
            className="hover-scale"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
              className="px-3"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Monat
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
              className="px-3"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Woche
            </Button>
          </div>

          <Button 
            className="bg-gradient-primary text-white shadow-glow hover-scale" 
            onClick={onNewAppointment}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Neuer Termin</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-accent/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter:
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="pl-8 w-40"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Wartend</SelectItem>
            <SelectItem value="confirmed">Bestätigt</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="cancelled">Abgesagt</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.service}
          onValueChange={(value) => onFiltersChange({ ...filters, service: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Services</SelectItem>
            <SelectItem value="Erstberatung">Erstberatung</SelectItem>
            <SelectItem value="Physiotherapie">Physiotherapie</SelectItem>
            <SelectItem value="Massage">Massage</SelectItem>
            <SelectItem value="Krankengymnastik">Krankengymnastik</SelectItem>
            <SelectItem value="Kontrolle">Kontrolle</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={filters.aiOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, aiOnly: !filters.aiOnly })}
          className="text-xs"
        >
          Nur KI-Termine
        </Button>

        {(filters.status !== 'all' || filters.service !== 'all' || filters.aiOnly || filters.searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ status: 'all', service: 'all', aiOnly: false, searchTerm: '' })}
            className="text-xs text-muted-foreground"
          >
            Filter zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
}