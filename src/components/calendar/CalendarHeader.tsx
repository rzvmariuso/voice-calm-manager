import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Calendar, CalendarDays, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
              {formatTitle()}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  {appointmentStats.total} Termine heute
                </span>
              </div>
              {appointmentStats.aiBookings > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    {appointmentStats.aiBookings} AI Buchungen
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simple Navigation */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('prev')}
              className="h-9 w-9 p-0 border-0 hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onToday}
              className="h-9 px-4 text-sm border-0 hover:bg-accent"
            >
              Heute
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('next')}
              className="h-9 w-9 p-0 border-0 hover:bg-accent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-accent rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
              className={cn(
                "h-7 px-3 text-sm",
                viewMode === 'month' 
                  ? "bg-white shadow-sm text-foreground" 
                  : "hover:bg-transparent text-muted-foreground"
              )}
            >
              Monat
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
              className={cn(
                "h-7 px-3 text-sm",
                viewMode === 'week' 
                  ? "bg-white shadow-sm text-foreground" 
                  : "hover:bg-transparent text-muted-foreground"
              )}
            >
              Woche
            </Button>
          </div>

          <Button 
            size="sm"
            onClick={onNewAppointment}
            className="h-9 text-sm bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neuer Termin
          </Button>
        </div>
      </div>

      {/* Minimal Filters */}
      {(filters.status !== 'all' || filters.service !== 'all' || filters.aiOnly || filters.searchTerm) && (
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Aktive Filter:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  "{filters.searchTerm}"
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
                </Badge>
              )}
              {filters.service !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Service: {filters.service}
                </Badge>
              )}
              {filters.aiOnly && (
                <Badge variant="secondary" className="text-xs">
                  Nur AI Termine
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ status: 'all', service: 'all', aiOnly: false, searchTerm: '' })}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Alle Filter entfernen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search - Always visible but minimal */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Patienten, Services..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="pl-10 h-10 bg-white border-border focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-32 h-10 bg-white border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="pending">Wartend</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="completed">Erledigt</SelectItem>
              <SelectItem value="cancelled">Abgesagt</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={filters.aiOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, aiOnly: !filters.aiOnly })}
            className="h-10 px-4"
          >
            AI Filter
          </Button>
        </div>
      </div>
    </div>
  );
}