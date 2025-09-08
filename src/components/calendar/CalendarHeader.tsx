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
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Kalender
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-foreground">
                {formatTitle()}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold">
                  {appointmentStats.total} Termine
                </Badge>
                {appointmentStats.aiBookings > 0 && (
                  <Badge className="bg-gradient-secondary text-white shadow-sm">
                    {appointmentStats.aiBookings} KI-Termine
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center bg-card rounded-xl p-1 shadow-soft border border-border/60">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('prev')}
              className="hover-scale hover:bg-accent/50 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToday}
              className="hover-scale hover:bg-accent/50 rounded-lg px-4 mx-1 font-semibold"
            >
              Heute
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('next')}
              className="hover-scale hover:bg-accent/50 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-card rounded-xl p-1 shadow-soft border border-border/60">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === 'month' 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monat
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === 'week' 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Woche
            </Button>
          </div>

          <Button 
            className="bg-gradient-primary text-white shadow-glow hover-scale px-6 py-3 rounded-xl font-semibold" 
            onClick={onNewAppointment}
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Neuer Termin</span>
            <span className="sm:hidden">Neu</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-gradient-subtle rounded-2xl p-6 shadow-soft border border-border/60">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Header */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Filter & Suche</h3>
              <p className="text-sm text-muted-foreground">Termine durchsuchen und filtern</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-48">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Patient, Service oder Notizen suchen..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-10 bg-card border-border/60 rounded-xl shadow-sm hover:shadow-soft transition-all duration-200"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger className="w-36 bg-card border-border/60 rounded-xl shadow-sm hover:shadow-soft transition-all duration-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">🔄 Alle Status</SelectItem>
                <SelectItem value="pending">⏳ Wartend</SelectItem>
                <SelectItem value="confirmed">✅ Bestätigt</SelectItem>
                <SelectItem value="completed">🏁 Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">❌ Abgesagt</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.service}
              onValueChange={(value) => onFiltersChange({ ...filters, service: value })}
            >
              <SelectTrigger className="w-44 bg-card border-border/60 rounded-xl shadow-sm hover:shadow-soft transition-all duration-200">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">🏥 Alle Services</SelectItem>
                <SelectItem value="Erstberatung">💬 Erstberatung</SelectItem>
                <SelectItem value="Physiotherapie">🏃‍♂️ Physiotherapie</SelectItem>
                <SelectItem value="Massage">💆‍♀️ Massage</SelectItem>
                <SelectItem value="Krankengymnastik">🤸‍♀️ Krankengymnastik</SelectItem>
                <SelectItem value="Kontrolle">🔍 Kontrolle</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.aiOnly ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, aiOnly: !filters.aiOnly })}
              className={`
                px-4 py-2 rounded-xl font-semibold transition-all duration-200
                ${filters.aiOnly 
                  ? 'bg-gradient-secondary text-white shadow-glow hover-scale' 
                  : 'border-border/60 hover:bg-accent/50 hover-scale'
                }
              `}
            >
              🤖 KI-Termine
            </Button>

            {(filters.status !== 'all' || filters.service !== 'all' || filters.aiOnly || filters.searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ status: 'all', service: 'all', aiOnly: false, searchTerm: '' })}
                className="text-muted-foreground hover:text-foreground rounded-xl px-4 py-2 hover:bg-accent/30 transition-all duration-200"
              >
                ↻ Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}