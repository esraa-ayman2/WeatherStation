import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tempUnit',
  standalone: true,
})
export class TempUnitPipe implements PipeTransform {
  public transform(value: number | null | undefined, unit: 'C' | 'F' = 'C', precision = 0): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '--';
    }
    const formatted = precision > 0 ? value.toFixed(precision) : Math.round(value).toString();
    return `${formatted}°${unit}`;
  }
}
