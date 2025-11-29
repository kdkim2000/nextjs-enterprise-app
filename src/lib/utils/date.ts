/**
 * Date formatting utilities
 */

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

interface FormatDateOptions {
  locale?: string;
  style?: DateFormatStyle;
  includeTime?: boolean;
}

const styleMap: Record<DateFormatStyle, Intl.DateTimeFormatOptions> = {
  short: { year: 'numeric', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
};

/**
 * Format a date string or Date object to a localized string
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  if (!date) return '';

  const { locale = 'ko-KR', style = 'medium', includeTime = false } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      ...styleMap[style],
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };

    return dateObj.toLocaleDateString(locale, formatOptions);
  } catch {
    return '';
  }
}

/**
 * Format a date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @param locale - Locale string
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale: string = 'ko-KR'
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffDays > 30) {
      return formatDate(dateObj, { locale, style: 'medium' });
    } else if (diffDays > 0) {
      return rtf.format(-diffDays, 'day');
    } else if (diffHours > 0) {
      return rtf.format(-diffHours, 'hour');
    } else if (diffMins > 0) {
      return rtf.format(-diffMins, 'minute');
    } else {
      return rtf.format(-diffSecs, 'second');
    }
  } catch {
    return '';
  }
}

/**
 * Format duration in minutes to a readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1h 30m", "45m")
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}
