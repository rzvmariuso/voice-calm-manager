import { useState, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePatientDetails, PatientDetails } from '@/hooks/usePatientDetails';
import { User, Phone, Mail, MapPin, Calendar, FileText, Clock } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PatientHoverCardProps {
  patientId: string;
  patientName: string;
  children: React.ReactNode;
  className?: string;
}

export function PatientHoverCard({ 
  patientId, 
  patientName, 
  children, 
  className 
}: PatientHoverCardProps) {
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { fetchPatientDetails, isLoading } = usePatientDetails();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && !patientDetails && !isLoading(patientId)) {
      fetchPatientDetails(patientId).then(setPatientDetails);
    }
  }, [isOpen, patientId, patientDetails, fetchPatientDetails, isLoading]);

  const handlePatientClick = () => {
    navigate(`/patients/${patientId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bestätigt';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgesagt';
      case 'pending': return 'Wartend';
      default: return status;
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={100} open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <button
          onClick={handlePatientClick}
          className={cn(
            "text-left hover:text-primary hover:underline transition-colors cursor-pointer",
            className
          )}
        >
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="right" align="start">
        {patientDetails ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">{patientName}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {patientDetails.date_of_birth ? (
                    <span>
                      {getAge(patientDetails.date_of_birth)} Jahre
                      {patientDetails.city && ` • ${patientDetails.city}`}
                    </span>
                  ) : (
                    patientDetails.city && <span>{patientDetails.city}</span>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Contact Info */}
            <div className="space-y-2">
              {patientDetails.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{patientDetails.phone}</span>
                </div>
              )}
              {patientDetails.email && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{patientDetails.email}</span>
                </div>
              )}
              {patientDetails.address_line1 && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{patientDetails.address_line1}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{patientDetails.recentAppointments.length} Termine</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{patientDetails.notesCount} Notizen</span>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Recent Appointments */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Letzte Termine
              </h5>
              {patientDetails.recentAppointments.length > 0 ? (
                <div className="space-y-1">
                  {patientDetails.recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {format(new Date(appointment.appointment_date), 'dd.MM.yy', { locale: de })}
                        </span>
                        <span className="font-medium truncate">{appointment.service}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 h-auto", getStatusColor(appointment.status))}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Keine vergangenen Termine</p>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Patient seit {format(new Date(patientDetails.created_at), 'MMM yyyy', { locale: de })}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}