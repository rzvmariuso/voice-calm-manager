import { useMemo } from "react";
import { isSameDay, parse, isWithinInterval } from "date-fns";
import { AppointmentWithPatient } from "./useAppointments";

interface TimeSlot {
  start: Date;
  end: Date;
}

interface ConflictInfo {
  hasConflict: boolean;
  conflictingAppointments: AppointmentWithPatient[];
  message?: string;
}

export function useConflictDetection(appointments: AppointmentWithPatient[]) {
  
  const parseAppointmentTime = (appointment: AppointmentWithPatient): TimeSlot => {
    const appointmentDate = new Date(appointment.appointment_date);
    const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
    
    const start = new Date(appointmentDate);
    start.setHours(hours, minutes, 0, 0);
    
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + (appointment.duration_minutes || 30));
    
    return { start, end };
  };

  const checkAppointmentConflicts = (
    targetAppointment: Partial<AppointmentWithPatient> & {
      appointment_date: string;
      appointment_time: string;
      duration_minutes?: number;
      id?: string;
    }
  ): ConflictInfo => {
    if (!targetAppointment.appointment_date || !targetAppointment.appointment_time) {
      return { hasConflict: false, conflictingAppointments: [] };
    }

    const targetDate = new Date(targetAppointment.appointment_date);
    const [targetHours, targetMinutes] = targetAppointment.appointment_time.split(':').map(Number);
    
    const targetStart = new Date(targetDate);
    targetStart.setHours(targetHours, targetMinutes, 0, 0);
    
    const targetEnd = new Date(targetStart);
    targetEnd.setMinutes(targetStart.getMinutes() + (targetAppointment.duration_minutes || 30));

    const conflictingAppointments = appointments.filter(appointment => {
      // Skip self when editing
      if (targetAppointment.id && appointment.id === targetAppointment.id) {
        return false;
      }

      // Only check appointments on the same day
      const appointmentDate = new Date(appointment.appointment_date);
      if (!isSameDay(appointmentDate, targetDate)) {
        return false;
      }

      const { start, end } = parseAppointmentTime(appointment);

      // Check for time overlap
      const hasOverlap = (
        (targetStart >= start && targetStart < end) || // Target starts during existing
        (targetEnd > start && targetEnd <= end) ||     // Target ends during existing  
        (targetStart <= start && targetEnd >= end)     // Target encompasses existing
      );

      return hasOverlap;
    });

    const hasConflict = conflictingAppointments.length > 0;
    let message: string | undefined;

    if (hasConflict) {
      const conflictCount = conflictingAppointments.length;
      if (conflictCount === 1) {
        const conflict = conflictingAppointments[0];
        message = `Konflikt mit Termin von ${conflict.patient?.first_name} ${conflict.patient?.last_name} um ${conflict.appointment_time} Uhr`;
      } else {
        message = `Konflikt mit ${conflictCount} anderen Terminen zur gleichen Zeit`;
      }
    }

    return {
      hasConflict,
      conflictingAppointments,
      message
    };
  };

  const getTimeSlotConflicts = (date: Date, timeSlot: string): AppointmentWithPatient[] => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      if (!isSameDay(appointmentDate, date)) {
        return false;
      }

      const [slotHour] = timeSlot.split(':').map(Number);
      const [appointmentHours, appointmentMinutes] = appointment.appointment_time.split(':').map(Number);
      
      const slotStart = new Date(date);
      slotStart.setHours(slotHour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotHour + 1, 0, 0, 0);

      const { start, end } = parseAppointmentTime(appointment);

      // Check if appointment overlaps with this hour slot
      return (start < slotEnd && end > slotStart);
    });
  };

  const getDayConflictSummary = (date: Date) => {
    const dayAppointments = appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointment_date), date)
    );

    const conflicts: Array<{
      appointments: AppointmentWithPatient[];
      timeRange: string;
    }> = [];

    // Group overlapping appointments
    const processedIds = new Set<string>();

    dayAppointments.forEach(appointment => {
      if (processedIds.has(appointment.id)) return;

      const overlapping = [appointment];
      const { start, end } = parseAppointmentTime(appointment);

      // Find all appointments that overlap with this one
      dayAppointments.forEach(otherAppointment => {
        if (otherAppointment.id === appointment.id || processedIds.has(otherAppointment.id)) {
          return;
        }

        const { start: otherStart, end: otherEnd } = parseAppointmentTime(otherAppointment);
        
        const hasOverlap = (
          (start >= otherStart && start < otherEnd) ||
          (end > otherStart && end <= otherEnd) ||
          (start <= otherStart && end >= otherEnd)
        );

        if (hasOverlap) {
          overlapping.push(otherAppointment);
          processedIds.add(otherAppointment.id);
        }
      });

      processedIds.add(appointment.id);

      if (overlapping.length > 1) {
        const times = overlapping.map(apt => apt.appointment_time).sort();
        const timeRange = `${times[0]} - ${times[times.length - 1]}`;
        conflicts.push({ appointments: overlapping, timeRange });
      }
    });

    return conflicts;
  };

  return {
    checkAppointmentConflicts,
    getTimeSlotConflicts,
    getDayConflictSummary,
    parseAppointmentTime
  };
}