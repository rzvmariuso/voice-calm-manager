import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar as CalendarIcon, Users, Activity, Database, ChevronDown } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ExportDataProps {
  className?: string;
}

type ExportFormat = 'csv' | 'json' | 'pdf';
type DataType = 'appointments' | 'patients' | 'analytics' | 'notes';

interface ExportOptions {
  dataTypes: DataType[];
  format: ExportFormat;
  dateRange: {
    from: Date;
    to: Date;
  };
  includeDeleted: boolean;
  includePersonalData: boolean;
}

const dataTypeLabels = {
  appointments: 'Termine',
  patients: 'Patienten',
  analytics: 'Statistiken',
  notes: 'Notizen'
};

const formatLabels = {
  csv: 'CSV (Excel kompatibel)',
  json: 'JSON (Rohdaten)',
  pdf: 'PDF (Bericht)'
};

const predefinedRanges = [
  { label: 'Letzte 7 Tage', days: 7 },
  { label: 'Letzte 30 Tage', days: 30 },
  { label: 'Letzte 3 Monate', days: 90 },
  { label: 'Letztes Jahr', days: 365 },
];

export function ExportData({ className }: ExportDataProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [options, setOptions] = useState<ExportOptions>({
    dataTypes: ['appointments'],
    format: 'csv',
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    },
    includeDeleted: false,
    includePersonalData: true
  });

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const toggleDataType = (dataType: DataType) => {
    const newDataTypes = options.dataTypes.includes(dataType)
      ? options.dataTypes.filter(t => t !== dataType)
      : [...options.dataTypes, dataType];
    updateOptions({ dataTypes: newDataTypes });
  };

  const setPredefinedRange = (days: number) => {
    updateOptions({
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date()
      }
    });
  };

  const exportAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, email, phone),
        practice:practices(name)
      `)
      .gte('appointment_date', format(options.dateRange.from, 'yyyy-MM-dd'))
      .lte('appointment_date', format(options.dateRange.to, 'yyyy-MM-dd'));

    if (error) throw error;
    return data;
  };

  const exportPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .gte('created_at', options.dateRange.from.toISOString())
      .lte('created_at', options.dateRange.to.toISOString());

    if (error) throw error;
    return data;
  };

  const exportNotes = async () => {
    // Since patient_notes table doesn't exist yet, return empty array
    return [];
  };

  const generateCSV = (data: any[], type: string) => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).filter(key => {
      if (!options.includePersonalData) {
        const sensitiveFields = ['email', 'phone', 'address_line1', 'address_line2', 'date_of_birth'];
        return !sensitiveFields.includes(key);
      }
      return true;
    });

    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const performExport = async () => {
    if (options.dataTypes.length === 0) {
      toast({
        title: "Keine Daten ausgewählt",
        description: "Bitte wählen Sie mindestens einen Datentyp aus",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      const results: { [key: string]: any[] } = {};
      const totalSteps = options.dataTypes.length;

      for (let i = 0; i < options.dataTypes.length; i++) {
        const dataType = options.dataTypes[i];
        setExportProgress(((i + 1) / totalSteps) * 100);

        switch (dataType) {
          case 'appointments':
            results.appointments = await exportAppointments();
            break;
          case 'patients':
            results.patients = await exportPatients();
            break;
          case 'notes':
            results.notes = await exportNotes();
            break;
          case 'analytics':
            // Placeholder for analytics data
            results.analytics = [];
            break;
        }
      }

      // Generate export files
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      
      if (options.format === 'csv') {
        for (const [type, data] of Object.entries(results)) {
          if (data.length > 0) {
            const csv = generateCSV(data, type);
            downloadFile(csv, `voxcal-${type}-${timestamp}.csv`, 'text/csv');
          }
        }
      } else if (options.format === 'json') {
        const jsonData = {
          exportDate: new Date().toISOString(),
          dateRange: options.dateRange,
          options: options,
          data: results
        };
        downloadFile(
          JSON.stringify(jsonData, null, 2), 
          `voxcal-export-${timestamp}.json`, 
          'application/json'
        );
      }

      toast({
        title: "Export erfolgreich",
        description: `Daten wurden als ${options.format.toUpperCase()} exportiert`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export-Fehler",
        description: "Die Daten konnten nicht exportiert werden",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Daten exportieren
        </CardTitle>
        <CardDescription>
          Exportieren Sie Ihre Praxisdaten für Backup oder Analyse
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Data Types Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Zu exportierende Daten</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(dataTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={options.dataTypes.includes(type as DataType)}
                  onCheckedChange={() => toggleDataType(type as DataType)}
                />
                <Label htmlFor={type} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Export-Format</Label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(formatLabels).map(([format, label]) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={format}
                  checked={options.format === format}
                  onCheckedChange={() => updateOptions({ format: format as ExportFormat })}
                />
                <Label htmlFor={format} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Zeitraum</Label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {predefinedRanges.map((range) => (
              <Button
                key={range.days}
                variant="outline"
                size="sm"
                onClick={() => setPredefinedRange(range.days)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Von</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !options.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(options.dateRange.from, "dd.MM.yyyy", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={options.dateRange.from}
                    onSelect={(date) => date && updateOptions({ 
                      dateRange: { ...options.dateRange, from: date }
                    })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !options.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(options.dateRange.to, "dd.MM.yyyy", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={options.dateRange.to}
                    onSelect={(date) => date && updateOptions({ 
                      dateRange: { ...options.dateRange, to: date }
                    })}
                    disabled={(date) => date > new Date() || date < options.dateRange.from}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Privacy Options */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Datenschutz-Optionen</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePersonalData"
                checked={options.includePersonalData}
                onCheckedChange={(checked) => updateOptions({ includePersonalData: !!checked })}
              />
              <Label htmlFor="includePersonalData" className="text-sm font-normal">
                Personenbezogene Daten einschließen (E-Mail, Telefon, Adresse)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDeleted"
                checked={options.includeDeleted}
                onCheckedChange={(checked) => updateOptions({ includeDeleted: !!checked })}
              />
              <Label htmlFor="includeDeleted" className="text-sm font-normal">
                Gelöschte Einträge einschließen
              </Label>
            </div>
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exportiere Daten...</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={performExport}
          disabled={isExporting || options.dataTypes.length === 0}
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exportiere...' : 'Export starten'}
        </Button>

        {/* Export Summary */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Export-Übersicht:</p>
          <p>• Datentypen: {options.dataTypes.map(t => dataTypeLabels[t]).join(', ')}</p>
          <p>• Format: {formatLabels[options.format]}</p>
          <p>• Zeitraum: {format(options.dateRange.from, 'dd.MM.yyyy', { locale: de })} - {format(options.dateRange.to, 'dd.MM.yyyy', { locale: de })}</p>
          <p>• Personendaten: {options.includePersonalData ? 'Ja' : 'Nein'}</p>
        </div>
      </CardContent>
    </Card>
  );
}