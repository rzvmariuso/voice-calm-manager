import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  UserCheck,
  UserX,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { nowInBerlin, formatInBerlinTime, toBerlinTime } from "@/lib/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalPatients: number;
  newPatients: number;
  averageDuration: number;
  popularServices: Array<{ service: string; count: number }>;
  monthlyData: Array<{ month: string; appointments: number; patients: number }>;
  weeklyData: Array<{ day: string; appointments: number }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export function Analytics() {
  const { practice } = usePractice();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '1y'>('30d');

  useEffect(() => {
    if (practice) {
      loadAnalytics();
    }
  }, [practice, timeRange]);

  const getDateRange = () => {
    const now = nowInBerlin();
    switch (timeRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '3m':
        return { start: subMonths(now, 3), end: now };
      case '1y':
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const loadAnalytics = async () => {
    if (!practice) return;

    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Load appointments data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients (
            id,
            first_name,
            last_name,
            created_at
          )
        `)
        .eq('practice_id', practice.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (appointmentsError) throw appointmentsError;

      // Load patients data
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('practice_id', practice.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (patientsError) throw patientsError;

      // Calculate analytics
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
      const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0;
      const totalPatients = patients?.length || 0;

      // Calculate service popularity
      const serviceCount: { [key: string]: number } = {};
      appointments?.forEach(appointment => {
        serviceCount[appointment.service] = (serviceCount[appointment.service] || 0) + 1;
      });
      
      const popularServices = Object.entries(serviceCount)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average duration
      const totalDuration = appointments?.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) || 0;
      const averageDuration = totalAppointments > 0 ? Math.round(totalDuration / totalAppointments) : 0;

      // Monthly data for the last 6 months
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(nowInBerlin(), i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthAppointments = appointments?.filter(a => {
          const appointmentDate = new Date(a.created_at);
          return appointmentDate >= monthStart && appointmentDate <= monthEnd;
        }).length || 0;

        const monthPatients = patients?.filter(p => {
          const patientDate = new Date(p.created_at);
          return patientDate >= monthStart && patientDate <= monthEnd;
        }).length || 0;

        monthlyData.push({
          month: format(month, 'MMM', { locale: de }),
          appointments: monthAppointments,
          patients: monthPatients
        });
      }

      // Weekly data for the last 7 days
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(nowInBerlin(), i);
        const dayAppointments = appointments?.filter(a => {
          const appointmentDate = new Date(a.appointment_date);
          return format(appointmentDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        }).length || 0;

        weeklyData.push({
          day: format(day, 'EEE', { locale: de }),
          appointments: dayAppointments
        });
      }

      // Status data for pie chart
      const statusData = [
        { name: 'Abgeschlossen', value: completedAppointments, color: COLORS[0] },
        { name: 'Ausstehend', value: appointments?.filter(a => a.status === 'pending').length || 0, color: COLORS[1] },
        { name: 'Abgesagt', value: cancelledAppointments, color: COLORS[2] },
        { name: 'Nicht erschienen', value: noShowAppointments, color: COLORS[3] }
      ].filter(item => item.value > 0);

      setAnalytics({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        totalPatients,
        newPatients: totalPatients,
        averageDuration,
        popularServices,
        monthlyData,
        weeklyData,
        statusData
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metrik', 'Wert'],
      ['Termine gesamt', analytics.totalAppointments.toString()],
      ['Abgeschlossene Termine', analytics.completedAppointments.toString()],
      ['Abgesagte Termine', analytics.cancelledAppointments.toString()],
      ['Patienten gesamt', analytics.totalPatients.toString()],
      ['Durchschnittliche Dauer (Min)', analytics.averageDuration.toString()],
      ...analytics.popularServices.map(s => [`Service: ${s.service}`, s.count.toString()])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${formatInBerlinTime(nowInBerlin(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Keine Analysedaten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Detaillierte Einblicke in Ihre Praxis</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="3m">3 Monate</SelectItem>
              <SelectItem value="1y">1 Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termine gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedAppointments} abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patienten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Neue Registrierungen
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalAppointments > 0 
                ? Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Abgeschlossene Termine
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Dauer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageDuration}min</div>
            <p className="text-xs text-muted-foreground">
              Pro Termin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Appointments over time */}
        <Card>
          <CardHeader>
            <CardTitle>Termine Verlauf</CardTitle>
            <CardDescription>Terminentwicklung der letzten 6 Monate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Termine"
                />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Neue Patienten"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Termin Status</CardTitle>
            <CardDescription>Verteilung der Terminstatusarten</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly appointments and popular services */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wochenverlauf</CardTitle>
            <CardDescription>Termine der letzten 7 Tage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beliebte Leistungen</CardTitle>
            <CardDescription>Top 5 gebuchte Behandlungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularServices.map((service, index) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <Badge variant="secondary">
                    {service.count} Termine
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}