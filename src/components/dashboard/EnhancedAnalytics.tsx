import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

interface AnalyticsData {
  weeklyAppointments: Array<{ name: string; appointments: number; date: string }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  peakHours: Array<{ hour: string; count: number }>;
  monthlyTrend: Array<{ month: string; appointments: number; patients: number }>;
  noShowRate: number;
  avgAppointmentDuration: number;
  busyDays: Array<{ day: string; count: number }>;
  upcomingAppointments: number;
  totalRevenue: number;
}

export function EnhancedAnalytics() {
  const { practice } = usePractice();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // days

  useEffect(() => {
    if (practice) {
      loadAnalytics();
    }
  }, [practice, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Get appointments for the time range
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id, appointment_date, appointment_time, status, 
          duration_minutes, service,
          patient:patients(id, first_name, last_name)
        `)
        .eq('practice_id', practice?.id)
        .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
        .order('appointment_date', { ascending: true });

      if (!appointments) return;

      // Weekly appointments data
      const weeklyData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayAppointments = appointments.filter(
          app => app.appointment_date === format(date, 'yyyy-MM-dd')
        );
        weeklyData.push({
          name: format(date, 'EEE', { locale: de }),
          appointments: dayAppointments.length,
          date: format(date, 'yyyy-MM-dd')
        });
      }

      // Status distribution
      const statusCounts = appointments.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusColors = {
        'pending': '#f59e0b',
        'confirmed': '#10b981',
        'completed': '#3b82f6',
        'cancelled': '#ef4444',
        'no-show': '#8b5cf6'
      };

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColors[status as keyof typeof statusColors] || '#6b7280'
      }));

      // Peak hours analysis
      const hourCounts = appointments.reduce((acc, app) => {
        const hour = app.appointment_time.substring(0, 2);
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      // No-show rate
      const noShows = appointments.filter(app => app.status === 'no-show').length;
      const noShowRate = appointments.length > 0 ? (noShows / appointments.length) * 100 : 0;

      // Average duration
      const totalDuration = appointments.reduce((sum, app) => sum + (app.duration_minutes || 30), 0);
      const avgAppointmentDuration = appointments.length > 0 ? totalDuration / appointments.length : 30;

      // Busy days
      const dayMap = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      const dayCounts = appointments.reduce((acc, app) => {
        const dayIndex = new Date(app.appointment_date).getDay();
        const dayName = dayMap[dayIndex];
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const busyDays = Object.entries(dayCounts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count);

      // Upcoming appointments
      const today = format(new Date(), 'yyyy-MM-dd');
      const upcomingAppointments = appointments.filter(
        app => app.appointment_date >= today && app.status !== 'cancelled'
      ).length;

      // Monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfWeek(subDays(new Date(), i * 30));
        const monthEnd = endOfWeek(subDays(new Date(), (i - 1) * 30));
        
        const monthAppointments = appointments.filter(app => {
          const appDate = new Date(app.appointment_date);
          return appDate >= monthStart && appDate <= monthEnd;
        });

        const uniquePatients = new Set(monthAppointments.map(app => app.patient.id)).size;

        monthlyTrend.push({
          month: format(monthStart, 'MMM', { locale: de }),
          appointments: monthAppointments.length,
          patients: uniquePatients
        });
      }

      setAnalytics({
        weeklyAppointments: weeklyData,
        statusDistribution,
        peakHours,
        monthlyTrend,
        noShowRate,
        avgAppointmentDuration,
        busyDays,
        upcomingAppointments,
        totalRevenue: 0 // Placeholder
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="grid gap-6">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommende Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Diese Woche geplant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.noShowRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              {analytics.noShowRate < 10 ? (
                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analytics.noShowRate < 10 ? "text-green-600" : "text-red-600"}>
                {analytics.noShowRate < 10 ? "Niedrig" : "Hoch"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Termindauer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.avgAppointmentDuration)} Min</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittliche Dauer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivste Tage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.busyDays[0]?.day || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.busyDays[0]?.count || 0} Termine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Wöchentliche Termine</CardTitle>
            <CardDescription>Termine der letzten {timeRange} Tage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Terminstatus Verteilung</CardTitle>
            <CardDescription>Aktuelle Statusverteilung</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Spitzenzeiten</CardTitle>
            <CardDescription>Termine nach Tageszeit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monatlicher Trend</CardTitle>
            <CardDescription>Termine und Patienten über Zeit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="hsl(var(--primary))" 
                  name="Termine"
                />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="hsl(var(--secondary))" 
                  name="Patienten"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}