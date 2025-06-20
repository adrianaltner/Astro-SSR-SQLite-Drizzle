/**
 * Format a date to a localized string with proper timezone handling
 * @param timestamp The timestamp to format (Date object or number)
 * @param format The format to use ('short', 'full', or 'time')
 * @returns Formatted date string
 */
export function formatDate(timestamp: Date | number, format: 'short' | 'full' | 'time' = 'full'): string {
  // Ensure we're working with a Date object
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // Create options based on the format requested
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Berlin'
      };
      break;
    case 'time':
      options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Berlin'
      };
      break;
    case 'full':
    default:
      options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Berlin'
      };
  }
  
  return new Intl.DateTimeFormat('de-DE', options).format(date);
}

/**
 * Format a date in ISO format
 * @param timestamp The timestamp to format
 * @returns ISO-formatted date string
 */
export function toISOString(timestamp: Date | number): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
}

/**
 * Get the current date/time in the specified timezone
 * @returns Current date in Europe/Berlin timezone
 */
export function getCurrentLocalDate(): Date {
  // Get the current date in the specified timezone
  const now = new Date();
  
  // No direct way to create a Date in a specific timezone in JS
  // But for display purposes, our formatDate function will handle the timezone
  return now;
}
