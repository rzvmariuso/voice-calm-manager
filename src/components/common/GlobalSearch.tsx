import { useState, useEffect } from "react";
import { Search, User, Calendar, Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'service';
  title: string;
  subtitle: string;
  date?: string;
  route: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { practice } = usePractice();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length >= 2 && practice) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, practice]);

  const performSearch = async () => {
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .eq('practice_id', practice?.id)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);

      patients?.forEach(patient => {
        searchResults.push({
          id: patient.id,
          type: 'patient',
          title: `${patient.first_name} ${patient.last_name}`,
          subtitle: patient.email || patient.phone || 'Keine Kontaktdaten',
          route: `/patients/${patient.id}`
        });
      });

      // Search appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id, service, appointment_date, appointment_time,
          patient:patients(first_name, last_name)
        `)
        .eq('practice_id', practice?.id)
        .or(`service.ilike.%${query}%`)
        .limit(5);

      appointments?.forEach(appointment => {
        searchResults.push({
          id: appointment.id,
          type: 'appointment',
          title: appointment.service,
          subtitle: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          date: `${format(new Date(appointment.appointment_date), "dd.MM.yyyy", { locale: de })} ${appointment.appointment_time}`,
          route: `/appointments`
        });
      });

      // Search services
      const { data: services } = await supabase
        .from('practice_services')
        .select('id, name, description, duration_minutes')
        .eq('practice_id', practice?.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      services?.forEach(service => {
        searchResults.push({
          id: service.id,
          type: 'service',
          title: service.name,
          subtitle: service.description || `${service.duration_minutes} Min.`,
          route: `/settings#services`
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    onOpenChange(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return User;
      case 'appointment': return Calendar;
      case 'service': return Clock;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return 'Patient';
      case 'appointment': return 'Termin';
      case 'service': return 'Service';
      default: return 'Eintrag';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Globale Suche</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Patienten, Termine, Services durchsuchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {results.length > 0 && (
          <div className="px-6 pb-6 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = getIcon(result.type);
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                      {result.date && (
                        <p className="text-xs text-muted-foreground">
                          {result.date}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="px-6 pb-6 text-center text-muted-foreground">
            Keine Ergebnisse für "{query}" gefunden.
          </div>
        )}

        {query.length > 0 && query.length < 2 && (
          <div className="px-6 pb-6 text-center text-muted-foreground">
            Mindestens 2 Zeichen eingeben...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}