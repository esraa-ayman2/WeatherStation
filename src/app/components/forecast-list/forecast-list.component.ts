import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherApiResponse, ForecastDayItem } from '../../interfaces';

@Component({
  selector: 'app-forecast-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-list.component.html',
  styleUrls: ['./forecast-list.component.css'],
})
export class ForecastListComponent {
  @Input() data: WeatherApiResponse | null = null;
  @Input() unit: 'C' | 'F' = 'C';

  public get forecastDays(): ForecastDayItem[] {
    return this.data?.forecast?.forecastday || [];
  }

  public getDayName(dateStr: string, idx: number): string {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    const dateObj = new Date(dateStr + 'T12:00:00');
    return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  }

  public getMaxTemp(fDay: ForecastDayItem): number {
    return this.unit === 'C'
      ? Math.round(fDay.day.maxtemp_c)
      : Math.round(fDay.day.maxtemp_f);
  }

  public getMinTemp(fDay: ForecastDayItem): number {
    return this.unit === 'C'
      ? Math.round(fDay.day.mintemp_c)
      : Math.round(fDay.day.mintemp_f);
  }

  public getIconUrl(icon: string): string {
    return icon.startsWith('//') ? `https:${icon}` : icon;
  }
}
