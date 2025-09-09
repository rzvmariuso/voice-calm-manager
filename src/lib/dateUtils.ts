import { format as fnsFormat, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";

export const TIMEZONE = "Europe/Berlin";

/**
 * Formatiert ein Datum in der Europe/Berlin Zeitzone
 */
export function formatInBerlinTime(date: Date | string, formatStr: string) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, TIMEZONE, formatStr, { locale: de });
}

/**
 * Konvertiert ein UTC-Datum zu Berlin-Zeit
 */
export function toBerlinTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, TIMEZONE);
}

/**
 * Konvertiert ein Berlin-Zeit-Datum zu UTC
 */
export function fromBerlinTime(date: Date): Date {
  return fromZonedTime(date, TIMEZONE);
}

/**
 * Erstellt ein neues Datum in Berlin-Zeit für heute
 */
export function nowInBerlin(): Date {
  return toBerlinTime(new Date());
}

/**
 * Formatiert ein Datum in deutschem Standard-Format (Berlin-Zeit)
 */
export function formatGermanDate(date: Date | string): string {
  return formatInBerlinTime(date, "dd.MM.yyyy");
}

/**
 * Formatiert ein Datum mit Zeit in deutschem Format (Berlin-Zeit)
 */
export function formatGermanDateTime(date: Date | string): string {
  return formatInBerlinTime(date, "dd.MM.yyyy HH:mm");
}

/**
 * Formatiert nur die Zeit in deutschem Format (Berlin-Zeit)
 */
export function formatGermanTime(date: Date | string): string {
  return formatInBerlinTime(date, "HH:mm");
}

/**
 * Erstellt ein Datum für heute um 0:00 Uhr in Berlin-Zeit
 */
export function startOfTodayInBerlin(): Date {
  const now = nowInBerlin();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Prüft ob ein Datum heute ist (Berlin-Zeit)
 */
export function isTodayInBerlin(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const berlinDate = toBerlinTime(dateObj);
  const today = nowInBerlin();
  
  return berlinDate.toDateString() === today.toDateString();
}

/**
 * Formatiert Zeit für Termine (HH:MM ohne Sekunden)
 */
export function formatAppointmentTime(timeStr: string): string {
  return timeStr.slice(0, 5); // Entfernt Sekunden aus HH:MM:SS Format
}