import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface DateTimeProps extends BaseComponentProps {
  /** The day input - can be semantic ('today', 'yesterday', 'tomorrow') or specific date string */
  day?: string;
  /** The time input - can be semantic ('now') or specific time string */
  time?: string;
  /** Format for the output - supports locale formatting options */
  format?: 'full' | 'long' | 'medium' | 'short' | 'custom';
  /** Custom format string when format is 'custom' */
  customFormat?: string;
  /** Locale for formatting (defaults to system locale) */
  locale?: string;
  /** Timezone for formatting (defaults to system timezone) */
  timezone?: string;
  /** Whether to include time in the output (default: false if only day is provided) */
  includeTime?: boolean;
  /** Whether to include the day of week in the output (default: true) */
  includeDayOfWeek?: boolean;
}

export function DateTime(props: DateTimeProps): Component {
  const {
    day,
    time,
    format = 'full',
    customFormat,
    locale,
    timezone,
    includeTime,
    includeDayOfWeek = true,
    syntax = 'text',
    className,
    speaker,
    children = []
  } = props;

  try {
    // Parse the date and time
    const dateTime = parseDateTime(day, time, timezone);
    
    // Format the result
    const formattedDateTime = formatDateTime(
      dateTime,
      format,
      customFormat,
      locale,
      includeTime,
      includeDayOfWeek
    );

    // Generate the component based on syntax
    switch (syntax) {
      case 'markdown':
        return generateMarkdownDateTime(formattedDateTime, className, speaker);
      
      case 'html':
        return generateHtmlDateTime(formattedDateTime, className, speaker);
      
      case 'json':
        return generateJsonDateTime(dateTime, formattedDateTime, className, speaker);
      
      case 'yaml':
        return generateYamlDateTime(dateTime, formattedDateTime, className, speaker);
      
      case 'xml':
        return generateXmlDateTime(dateTime, formattedDateTime, className, speaker);
      
      case 'text':
      default:
        return generatePlainDateTime(formattedDateTime, className, speaker);
    }
  } catch (error) {
    const errorMessage = `Error formatting date/time: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return createElement('span', { className, 'data-speaker': speaker }, errorMessage);
  }
}

function parseDateTime(day?: string, time?: string, timezone?: string): Date {
  let targetDate = new Date();

  // Parse day input
  if (day) {
    const parsedDay = parseSemanticDay(day);
    if (parsedDay) {
      targetDate = parsedDay;
    } else {
      // Try to parse as a specific date
      const customDate = new Date(day);
      if (!isNaN(customDate.getTime())) {
        targetDate = customDate;
      } else {
        throw new Error(`Invalid day format: ${day}`);
      }
    }
  }

  // Parse time input
  if (time) {
    const parsedTime = parseSemanticTime(time);
    if (parsedTime) {
      targetDate.setHours(parsedTime.hours, parsedTime.minutes, parsedTime.seconds || 0, 0);
    } else {
      // Try to parse as specific time
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        const ampm = timeMatch[4];

        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
        }

        targetDate.setHours(hours, minutes, seconds, 0);
      } else {
        throw new Error(`Invalid time format: ${time}`);
      }
    }
  }

  return targetDate;
}

function parseSemanticDay(day: string): Date | null {
  const today = new Date();
  const lowerDay = day.toLowerCase().trim();

  switch (lowerDay) {
    case 'today':
      return new Date(today);
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    
    case 'tomorrow':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    
    case 'last week':
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return lastWeek;
    
    case 'next week':
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    
    default:
      // Check for relative days like "3 days ago" or "in 2 days"
      const relativeMatch = lowerDay.match(/^(?:in\s+)?(\d+)\s+days?\s+(?:ago|from\s+now)?$|^(\d+)\s+days?\s+ago$/);
      if (relativeMatch) {
        const days = parseInt(relativeMatch[1] || relativeMatch[2]);
        const relative = new Date(today);
        
        if (lowerDay.includes('ago')) {
          relative.setDate(relative.getDate() - days);
        } else {
          relative.setDate(relative.getDate() + days);
        }
        
        return relative;
      }
      
      return null;
  }
}

function parseSemanticTime(time: string): { hours: number; minutes: number; seconds?: number } | null {
  const lowerTime = time.toLowerCase().trim();

  switch (lowerTime) {
    case 'now':
      const now = new Date();
      return {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
      };
    
    case 'midnight':
      return { hours: 0, minutes: 0, seconds: 0 };
    
    case 'noon':
    case 'midday':
      return { hours: 12, minutes: 0, seconds: 0 };
    
    case 'morning':
      return { hours: 9, minutes: 0, seconds: 0 };
    
    case 'afternoon':
      return { hours: 14, minutes: 0, seconds: 0 };
    
    case 'evening':
      return { hours: 18, minutes: 0, seconds: 0 };
    
    case 'night':
      return { hours: 21, minutes: 0, seconds: 0 };
    
    default:
      return null;
  }
}

function formatDateTime(
  date: Date,
  format: string,
  customFormat?: string,
  locale?: string,
  includeTime?: boolean,
  includeDayOfWeek?: boolean
): string {
  const systemLocale = locale || Intl.DateTimeFormat().resolvedOptions().locale;
  
  // Determine if we should include time
  const shouldIncludeTime = includeTime !== undefined ? includeTime : false;

  if (format === 'custom' && customFormat) {
    return formatCustomDateTime(date, customFormat, systemLocale);
  }

  // Create Intl.DateTimeFormat options based on format
  let options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'full':
      options = {
        weekday: includeDayOfWeek ? 'long' : undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(shouldIncludeTime && {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      break;
    
    case 'long':
      options = {
        weekday: includeDayOfWeek ? 'long' : undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(shouldIncludeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      break;
    
    case 'medium':
      options = {
        weekday: includeDayOfWeek ? 'short' : undefined,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(shouldIncludeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      break;
    
    case 'short':
      options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        ...(shouldIncludeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      break;
    
    default:
      options = {
        weekday: includeDayOfWeek ? 'long' : undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(shouldIncludeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
  }

  return new Intl.DateTimeFormat(systemLocale, options).format(date);
}

function formatCustomDateTime(date: Date, format: string, locale: string): string {
  // Simple custom format implementation
  // Supports: YYYY, MM, DD, HH, mm, ss, WWW (weekday), MMM (month name)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const weekdays = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const shortMonthName = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/HH/g, hours.toString().padStart(2, '0'))
    .replace(/mm/g, minutes.toString().padStart(2, '0'))
    .replace(/ss/g, seconds.toString().padStart(2, '0'))
    .replace(/WWW/g, weekdays)
    .replace(/MMMM/g, monthName)
    .replace(/MMM/g, shortMonthName);
}

function generateMarkdownDateTime(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateHtmlDateTime(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('time', { className, 'data-speaker': speaker }, content);
}

function generateJsonDateTime(
  date: Date,
  formatted: string,
  className?: string,
  speaker?: string
): Component {
  const obj = {
    type: 'datetime',
    timestamp: date.toISOString(),
    formatted: formatted,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlDateTime(
  date: Date,
  formatted: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: datetime
timestamp: ${date.toISOString()}
formatted: ${JSON.stringify(formatted)}
timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlDateTime(
  date: Date,
  formatted: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<datetime timestamp="${date.toISOString()}" timezone="${Intl.DateTimeFormat().resolvedOptions().timeZone}">${formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</datetime>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generatePlainDateTime(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}
