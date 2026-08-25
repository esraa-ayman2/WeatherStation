import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationSuggestion } from '../../types';
import { WeatherService } from '../../services/weather.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnDestroy {
  @Input() isLoading = false;
  @Output() citySearch = new EventEmitter<string>();

  public searchQuery = '';
  public searchError = '';
  public suggestions: LocationSuggestion[] = [];
  public isSearchingSuggestions = false;
  public showSuggestions = false;
  public highlightedIndex = -1;
  public quickCities = [
    { name: 'Cairo', arabicName: 'القاهرة' },
    { name: 'London', arabicName: 'لندن' },
    { name: 'New York', arabicName: 'نيويورك' },
    { name: 'Tokyo', arabicName: 'طوكيو' },
    { name: 'Dubai', arabicName: 'دبي' },
    { name: 'Riyadh', arabicName: 'الرياض' },
  ];

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    public weatherService: WeatherService,
    private elementRef: ElementRef
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe((query) => {
        this.fetchSuggestions(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  public onInputChange(): void {
    if (this.searchError) {
      this.searchError = '';
    }

    this.highlightedIndex = -1;
    const trimmed = this.searchQuery.trim();

    if (trimmed.length >= 2) {
      this.isSearchingSuggestions = true;
      this.searchSubject.next(trimmed);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
      this.isSearchingSuggestions = false;
    }
  }

  public onInputFocus(): void {
    if (this.suggestions.length > 0 && this.searchQuery.trim().length >= 2) {
      this.showSuggestions = true;
    }
  }

  private async fetchSuggestions(query: string): Promise<void> {
    try {
      const results = await this.weatherService.searchLocations(query);
      this.suggestions = results;
      this.showSuggestions = results.length > 0 && this.searchQuery.trim().length >= 2;
    } catch (err) {
      console.warn('Error retrieving suggestions:', err);
    } finally {
      this.isSearchingSuggestions = false;
    }
  }

  public onSearch(): void {
    const trimmed = this.searchQuery.trim();
    if (!trimmed) {
      this.searchError = 'Please enter a city or station name to search.';
      return;
    }

    if (trimmed.length < 2) {
      this.searchError = 'Search term must be at least 2 characters.';
      return;
    }

    this.searchError = '';
    this.showSuggestions = false;
    this.weatherService.fetchWeather(trimmed);
  }

  public searchQuickCity(city: string): void {
    this.searchQuery = city;
    this.searchError = '';
    this.showSuggestions = false;
    this.weatherService.fetchWeather(city);
  }

  public selectSuggestion(suggestion: LocationSuggestion): void {
    const label = suggestion.name + (suggestion.country ? `, ${suggestion.country}` : '');
    this.searchQuery = label;
    this.searchError = '';
    this.showSuggestions = false;
    this.weatherService.fetchWeatherByCoords(
      suggestion.lat,
      suggestion.lon,
      suggestion.name,
      suggestion.region,
      suggestion.country
    );
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.onSearch();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Enter') {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.suggestions.length) {
        event.preventDefault();
        this.selectSuggestion(this.suggestions[this.highlightedIndex]);
      } else {
        event.preventDefault();
        this.onSearch();
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  public detectCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.searchError = 'Geolocation is not supported by your browser environment.';
      return;
    }

    this.searchError = '';
    this.showSuggestions = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.weatherService.fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        this.searchError = 'Could not access geolocation. Please enter a city name manually.';
      }
    );
  }
}

