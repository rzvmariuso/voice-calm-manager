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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-2xl font-medium">
              Kalender
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {formatTitle()}
              </p>
              <Badge variant="outline" className="text-xs">
                {appointmentStats.total} Termine
              </Badge>
              {appointmentStats.aiBookings > 0 && (
                <Badge className="text-xs bg-primary/10 text-primary">
                  {appointmentStats.aiBookings} KI
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToday}
              className="h-8 px-3 text-xs"
            >
              Heute
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
              className="h-8 px-3 text-xs"
            >
              Monat
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
              className="h-8 px-3 text-xs"
            >
              Woche
            </Button>
          </div>

          <Button 
            size="sm"
            onClick={onNewAppointment}
            className="h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Neu
          </Button>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="border rounded-lg p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-48">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-7 h-8 text-xs"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
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
              <SelectTrigger className="w-36 h-8 text-xs">
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
              className="h-8 text-xs"
            >
              KI-Termine
            </Button>

            {(filters.status !== 'all' || filters.service !== 'all' || filters.aiOnly || filters.searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ status: 'all', service: 'all', aiOnly: false, searchTerm: '' })}
                className="h-8 text-xs text-muted-foreground"
              >
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}