import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherApiResponse, ForecastDayItem } from '../../interfaces';

@Component({
  selector: 'app-today-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-forecast.component.html',
  styleUrls: ['./today-forecast.component.css'],
})
export class TodayForecastComponent {
  @Input() data: WeatherApiResponse | null = null;
  @Input() unit: 'C' | 'F' = 'C';

  public get current() {
    return this.data?.current;
  }

  public get location() {
    return this.data?.location;
  }

  public get todayForecast(): ForecastDayItem | null {
    return this.data?.forecast?.forecastday?.[0] || null;
  }

  public get tempDisplay(): number {
    if (!this.current) return 0;
    return this.unit === 'C' ? Math.round(this.current.temp_c) : Math.round(this.current.temp_f);
  }

  public get feelsLikeDisplay(): number {
    if (!this.current) return 0;
    return this.unit === 'C' ? Math.round(this.current.feelslike_c) : Math.round(this.current.feelslike_f);
  }

  public get maxTempDisplay(): number {
    if (!this.todayForecast) return 0;
    return this.unit === 'C'
      ? Math.round(this.todayForecast.day.maxtemp_c)
      : Math.round(this.todayForecast.day.maxtemp_f);
  }

  public get minTempDisplay(): number {
    if (!this.todayForecast) return 0;
    return this.unit === 'C'
      ? Math.round(this.todayForecast.day.mintemp_c)
      : Math.round(this.todayForecast.day.mintemp_f);
  }

  public get dayName(): string {
    if (!this.todayForecast) return 'Today';
    const dateObj = new Date(this.todayForecast.date + 'T12:00:00');
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  }

  public get formattedDate(): string {
    if (!this.todayForecast) return '';
    const dateObj = new Date(this.todayForecast.date + 'T12:00:00');
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  }

  public get iconUrl(): string {
    if (!this.current?.condition?.icon) return '';
    return this.current.condition.icon.startsWith('//')
      ? `https:${this.current.condition.icon}`
      : this.current.condition.icon;
  }

  public get currentHourNum(): number {
    return new Date().getHours();
  }

  public get filteredHourly() {
    if (!this.todayForecast?.hour) return [];
    return this.todayForecast.hour.filter((_, idx) => idx % 3 === 0);
  }

  public formatHourLabel(timeStr: string, idx: number): string {
    return timeStr.split(' ')[1] || `${idx * 3}:00`;
  }

  public isHourCurrent(timeStr: string, idx: number): boolean {
    const hourLabel = this.formatHourLabel(timeStr, idx);
    const hourInt = parseInt(hourLabel.split(':')[0], 10);
    return Math.abs(hourInt - this.currentHourNum) < 2;
  }

  public getHourTemp(hour: any): number {
    return this.unit === 'C' ? Math.round(hour.temp_c) : Math.round(hour.temp_f);
  }

  public getHourIcon(icon: string): string {
    return icon.startsWith('//') ? `https:${icon}` : icon;
  }
}
