import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  public transform(value: string | number | null | undefined): string {
    if (!value) return '';

    if (typeof value === 'string' && value.includes(' ')) {
      // Formats like "2026-08-24 18:00"
      const parts = value.split(' ');
      if (parts[1]) {
        return parts[1];
      }
    }

    if (typeof value === 'number') {
      const date = new Date(value * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return value.toString();
  }
}
