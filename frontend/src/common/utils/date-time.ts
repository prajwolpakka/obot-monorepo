import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateString(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export const formatDateRange = (dateRange?: DateRange): string | null => {
  if (!dateRange || !dateRange.from) return null;
  const fromFormatted = format(dateRange.from, "PP");
  const toFormatted = dateRange.to ? format(dateRange.to, "PP") : null;
  return toFormatted ? `${fromFormatted} - ${toFormatted}` : fromFormatted;
};
