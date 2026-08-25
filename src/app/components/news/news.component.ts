import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherNewsItem } from '../../interfaces';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
})
export class NewsComponent {
  @Output() backToHome = new EventEmitter<void>();

  public newsList: WeatherNewsItem[] = [];

  constructor(private weatherService: WeatherService) {
    this.newsList = this.weatherService.getNews();
  }

  public onBack(): void {
    this.backToHome.emit();
  }
}
