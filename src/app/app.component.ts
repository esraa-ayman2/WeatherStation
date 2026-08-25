import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WeatherService } from './services/weather.service';
import { NavTab, WeatherApiResponse } from './interfaces';


import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { TodayForecastComponent } from './components/today-forecast/today-forecast.component';
import { ForecastListComponent } from './components/forecast-list/forecast-list.component';
import { WeatherTelemetryComponent } from './components/weather-telemetry/weather-telemetry.component';
import { NewsComponent } from './components/news/news.component';
import { PhotosComponent } from './components/photos/photos.component';
import { ContactComponent } from './components/contact/contact.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SearchBarComponent,
    TodayForecastComponent,
    ForecastListComponent,
    WeatherTelemetryComponent,
    NewsComponent,
    PhotosComponent,
    ContactComponent,
    ChatbotComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public activeTab: NavTab = 'home';
  public weatherData: WeatherApiResponse | null = null;
  public isLoading = false;
  public errorMessage: string | null = null;
  public unit: 'C' | 'F' = 'C';
  public isNotFound = false;

  constructor(public weatherService: WeatherService, private router: Router) {}

  ngOnInit(): void {
    this.updateRouteState(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateRouteState(event.urlAfterRedirects));

    this.weatherService.weatherData$.subscribe((data) => {
      this.weatherData = data;
    });

    this.weatherService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });

    this.weatherService.error$.subscribe((err) => {
      this.errorMessage = err;
    });

    this.weatherService.unit$.subscribe((u) => {
      this.unit = u;
    });
  }

  public setTab(tab: NavTab): void {
    this.activeTab = tab;
    this.router.navigate(['/', tab === 'home' ? 'forecast' : tab]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateRouteState(url: string): void {
    const route = url.split('?')[0].replace(/^\//, '');
    this.isNotFound = route === '404';
    if (route === 'news' || route === 'photos' || route === 'contact') {
      this.activeTab = route;
    } else if (route === 'forecast' || route === '') {
      this.activeTab = 'home';
    }
  }
}
