import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherApiResponse } from '../../interfaces';

@Component({
  selector: 'app-weather-telemetry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-telemetry.component.html',
  styleUrls: ['./weather-telemetry.component.css'],
})
export class WeatherTelemetryComponent {
  @Input() data: WeatherApiResponse | null = null;

  public get current() {
    return this.data?.current;
  }

  public get uvRiskLevel(): string {
    const uv = this.current?.uv || 0;
    if (uv > 6) return 'High';
    if (uv > 2) return 'Moderate';
    return 'Low';
  }

  public get uvColorClass(): string {
    const uv = this.current?.uv || 0;
    if (uv > 6) return 'text-rose-400';
    if (uv > 2) return 'text-amber-400';
    return 'text-emerald-400';
  }

  public get humidityStatus(): string {
    const h = this.current?.humidity || 0;
    if (h < 40) return 'Dry';
    if (h > 70) return 'High';
    return 'Normal';
  }

  public get visibilityStatus(): string {
    const vis = this.current?.vis_km || 0;
    return vis >= 10 ? 'Optimal' : 'Reduced';
  }
}
