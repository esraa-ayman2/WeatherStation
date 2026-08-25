import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationSuggestion, WeatherApiResponse, WeatherNewsItem, WeatherPhotoItem } from '../types';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private weatherDataSubject = new BehaviorSubject<WeatherApiResponse | null>(null);
  public weatherData$: Observable<WeatherApiResponse | null> = this.weatherDataSubject.asObservable();

  public resolveCityName(city: string): string {
    return city;
  }

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  private unitSubject = new BehaviorSubject<'C' | 'F'>('C');
  public unit$: Observable<'C' | 'F'> = this.unitSubject.asObservable();

  private suggestionsController?: AbortController;
  private suggestionsRequestId = 0;
  private weatherRequestId = 0;

  private popularCities = ['Cairo', 'Alexandria', 'London', 'New York', 'Tokyo', 'Dubai', 'Paris', 'Sydney'];

  private searchAliases: Record<string, string> = {
    'مصر': 'Cairo',
    'القاهرة': 'Cairo',
    'الاسكندرية': 'Alexandria',
    'الإسكندرية': 'Alexandria',
    'انجلترا': 'London',
    'إنجلترا': 'London',
    'بريطانيا': 'London',
    'لندن': 'London',
    'امريكا': 'New York',
    'أمريكا': 'New York',
    'نيويورك': 'New York',
    'اليابان': 'Tokyo',
    'طوكيو': 'Tokyo',
    'الامارات': 'Dubai',
    'الإمارات': 'Dubai',
    'دبي': 'Dubai',
    'السعودية': 'Riyadh',
    'الرياض': 'Riyadh',
    'فرنسا': 'Paris',
    'باريس': 'Paris',
    'استراليا': 'Sydney',
    'أستراليا': 'Sydney',
    'سيدني': 'Sydney',
    'المانيا': 'Berlin',
    'ألمانيا': 'Berlin',
    'برلين': 'Berlin',
    'ايطاليا': 'Rome',
    'إيطاليا': 'Rome',
    'روما': 'Rome',
    'كندا': 'Toronto',
    'تورنتو': 'Toronto',
    'تركيا': 'Istanbul',
    'اسطنبول': 'Istanbul',
    'إسطنبول': 'Istanbul',
    'اسبانيا': 'Madrid',
    'إسبانيا': 'Madrid',
    'مدريد': 'Madrid',
    'قطر': 'Doha',
    'الدوحة': 'Doha',
    'الكويت': 'Kuwait City',
    'بيروت': 'Beirut',
    'لبنان': 'Beirut',
    'الاردن': 'Amman',
    'الأردن': 'Amman',
    'عمان': 'Amman',
    'جدة': 'Jeddah',
    'ابوظبي': 'Abu Dhabi',
    'أبوظبي': 'Abu Dhabi',
    'المنصورة': 'Mansoura',
    'الاقصر': 'Luxor',
    'الأقصر': 'Luxor',
    'اسوان': 'Aswan',
    'أسوان': 'Aswan',
  };

  // Global English cities fallback and instant autocomplete database
  private defaultSuggestions: LocationSuggestion[] = [
    { id: 1, name: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', lat: 30.0626, lon: 31.2497 },
    { id: 2, name: 'Alexandria', region: 'Alexandria Governorate', country: 'Egypt', lat: 31.2001, lon: 29.9187 },
    { id: 3, name: 'London', region: 'England', country: 'United Kingdom', lat: 51.5085, lon: -0.1257 },
    { id: 4, name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
    { id: 5, name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
    { id: 6, name: 'Paris', region: 'Ile-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
    { id: 7, name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
    { id: 8, name: 'Riyadh', region: 'Riyadh Province', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
    { id: 9, name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093 },
    { id: 10, name: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
    { id: 11, name: 'Rome', region: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964 },
    { id: 12, name: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.6532, lon: -79.3832 },
    { id: 13, name: 'Giza', region: 'Giza Governorate', country: 'Egypt', lat: 30.0131, lon: 31.2089 },
    { id: 14, name: 'Istanbul', region: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
    { id: 15, name: 'Madrid', region: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
    { id: 16, name: 'Singapore', region: 'Central Community', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { id: 17, name: 'Doha', region: 'Ad Dawhah', country: 'Qatar', lat: 25.2854, lon: 51.531 },
    { id: 18, name: 'Kuwait City', region: 'Al Asimah', country: 'Kuwait', lat: 29.3759, lon: 47.9774 },
    { id: 19, name: 'Beirut', region: 'Beirut Governorate', country: 'Lebanon', lat: 33.8938, lon: 35.5018 },
    { id: 20, name: 'Amman', region: 'Amman Governorate', country: 'Jordan', lat: 31.9454, lon: 35.9284 },
    { id: 21, name: 'Los Angeles', region: 'California', country: 'United States', lat: 34.0522, lon: -118.2437 },
    { id: 22, name: 'Chicago', region: 'Illinois', country: 'United States', lat: 41.8781, lon: -87.6298 },
    { id: 23, name: 'San Francisco', region: 'California', country: 'United States', lat: 37.7749, lon: -122.4194 },
    { id: 24, name: 'Miami', region: 'Florida', country: 'United States', lat: 25.7617, lon: -80.1918 },
    { id: 25, name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
    { id: 26, name: 'Vienna', region: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
    { id: 27, name: 'Abu Dhabi', region: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4539, lon: 54.3773 },
    { id: 28, name: 'Jeddah', region: 'Makkah Province', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925 },
    { id: 29, name: 'Mansoura', region: 'Dakahlia Governorate', country: 'Egypt', lat: 31.0409, lon: 31.3785 },
    { id: 30, name: 'Luxor', region: 'Luxor Governorate', country: 'Egypt', lat: 25.6872, lon: 32.6396 },
    { id: 31, name: 'Aswan', region: 'Aswan Governorate', country: 'Egypt', lat: 24.0889, lon: 32.8998 },
  ];

  private newsItems: WeatherNewsItem[] = [
    {
      id: 'news-1',
      title: 'Global Climate Patterns: Shifts in the Atlantic Jet Stream',
      summary: 'Meteorologists observe subtle shifts in the high-altitude jet streams causing extended dry spells and unexpected rainfall distribution across continents.',
      category: 'Climate Science',
      date: 'August 24, 2026',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
      source: 'World Weather Bulletin',
    },
    {
      id: 'news-2',
      title: 'How Next-Gen Satellite Radiometers Improve Storm Accuracy',
      summary: 'Geostationary optical sensors now deliver real-time cloud-top thermal imaging every 30 seconds, saving lives during severe thunderstorm developments.',
      category: 'Technology',
      date: 'August 22, 2026',
      readTime: '3 min read',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      source: 'Atmospheric Tech Digest',
    },
    {
      id: 'news-3',
      title: 'Autumn Equinox Preparations: What to Expect in Temperatures',
      summary: 'A comprehensive regional preview of transitioning temperature gradients as we approach the seasonal shift across both hemispheres.',
      category: 'Seasonal Forecast',
      date: 'August 20, 2026',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
      source: 'Meteorological Journal',
    },
    {
      id: 'news-4',
      title: 'Urban Heat Islands: How Modern Cities Are Cooling Down',
      summary: 'Reflective architecture and green vertical canopies show up to 3.5°C localized cooling in metropolitan centers worldwide.',
      category: 'Urban Ecology',
      date: 'August 18, 2026',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
      source: 'EcoWeather News',
    },
  ];

  private photosItems: WeatherPhotoItem[] = [
    {
      id: 'photo-1',
      title: 'Golden Sunset over Stratocumulus Banks',
      photographer: 'Esraa Ayman',
      location: 'Mediterranean Coast, Alexandria',
      category: 'Sunset',
      imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
      likes: 342,
    },
    {
      id: 'photo-2',
      title: 'Dramatic Cumulonimbus Storm Cell Approaching',
      photographer: 'Marcus Vance',
      location: 'Great Plains, USA',
      category: 'Storm',
      imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
      likes: 512,
    },
    {
      id: 'photo-3',
      title: 'Morning Mist Rising Through Pine Valley',
      photographer: 'Elena Rostova',
      location: 'Bavarian Alps, Germany',
      category: 'Clouds',
      imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
      likes: 428,
    },
    {
      id: 'photo-4',
      title: 'High-Altitude Cirrus Ribbons at Twilight',
      photographer: 'Tariq Mansoor',
      location: 'Sinai Peninsula, Egypt',
      category: 'Clouds',
      imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1200&q=80',
      likes: 671,
    },
    {
      id: 'photo-5',
      title: 'Aurora Borealis Dancing over Frozen Fjord',
      photographer: 'Astrid Lind',
      location: 'Tromsø, Norway',
      category: 'Aurora',
      imageUrl: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80',
      likes: 894,
    },
    {
      id: 'photo-6',
      title: 'First Snow Dusting on Alpine Needles',
      photographer: 'Lucas Meyer',
      location: 'Swiss Alps, Zermatt',
      category: 'Snow',
      imageUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
      likes: 619,
    },
  ];

  constructor() {
    this.fetchWeather('Cairo');
  }

  public getPopularCities(): string[] {
    return this.popularCities;
  }

  public getNews(): WeatherNewsItem[] {
    return this.newsItems;
  }

  public getPhotos(): WeatherPhotoItem[] {
    return this.photosItems;
  }

  public toggleUnit(): void {
    const next = this.unitSubject.value === 'C' ? 'F' : 'C';
    this.unitSubject.next(next);
  }

  /**
   * Fast location search offering suggestions as user types
   */
  public async searchLocations(query: string): Promise<LocationSuggestion[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const normalizedQuery = this.normalizeSearchText(trimmed);
    const apiQuery = this.resolveSearchAlias(normalizedQuery) || trimmed;
    const qLower = normalizedQuery;

    // 1. Instant local English cities matches
    const localMatches = this.defaultSuggestions.filter(
      (loc) =>
        this.normalizeSearchText(loc.name).includes(qLower) ||
        this.normalizeSearchText(loc.country).includes(qLower) ||
        this.normalizeSearchText(loc.region).includes(qLower) ||
        Object.entries(this.searchAliases).some(
          ([alias, city]) => alias.includes(qLower) && city.toLowerCase() === loc.name.toLowerCase()
        )
    );

    // 2. Fetch live Open-Meteo geocoding search in English
    try {
      const requestId = ++this.suggestionsRequestId;
      this.suggestionsController?.abort();
      const controller = new AbortController();
      this.suggestionsController = controller;
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(apiQuery)}&count=8&language=en&format=json`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (controller.signal.aborted) {
        return localMatches;
      }

      if (requestId !== this.suggestionsRequestId) {
        return [];
      }

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          const apiSuggestions: LocationSuggestion[] = data.results.map((r: any) => ({
            id: r.id,
            name: r.name,
            region: r.admin1 || r.admin2 || '',
            country: r.country || '',
            lat: r.latitude,
            lon: r.longitude,
          }));

          // Merge without duplicate coordinates
          const seen = new Set<string>();
          const combined: LocationSuggestion[] = [];

          for (const item of [...apiSuggestions, ...localMatches]) {
            const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(item);
            }
          }

          return combined.slice(0, 8);
        }
      }
    } catch (err) {
      // Network slow or abort -> use local instant matches
    }

    return localMatches;
  }

  /**
   * Fetches real live weather data for a given city string
   */
  public async fetchWeather(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;

    const requestId = ++this.weatherRequestId;
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      // Check if location is in local suggestions first for instant coordinates
      const normalizedQuery = this.normalizeSearchText(trimmed);
      const resolvedQuery = this.searchAliases[normalizedQuery] || trimmed;
      const qLower = this.normalizeSearchText(resolvedQuery);
      let matchedLocation = this.defaultSuggestions.find(
        (l) => this.normalizeSearchText(l.name) === qLower || `${this.normalizeSearchText(l.name)}, ${this.normalizeSearchText(l.country)}` === qLower
      );

      let lat = matchedLocation?.lat;
      let lon = matchedLocation?.lon;
      let cityName = matchedLocation?.name || trimmed;
      let region = matchedLocation?.region || '';
      let country = matchedLocation?.country || '';

      // If not in local list, resolve coordinates via Open-Meteo Geocoding
      if (!lat || !lon) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(resolvedQuery)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const first = geoData.results[0];
            lat = first.latitude;
            lon = first.longitude;
            cityName = first.name;
            region = first.admin1 || '';
            country = first.country || '';
          }
        }
      }

      if (typeof lat !== 'number' || typeof lon !== 'number') {
        throw new Error(`No weather station was found for "${trimmed}".`);
      }

      // Fetch live weather from Open-Meteo
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      const forecastRes = await fetch(forecastUrl);

      if (requestId !== this.weatherRequestId) return;

      if (!forecastRes.ok) {
        throw new Error(`Weather station failed to retrieve forecast for "${trimmed}".`);
      }

      const raw = await forecastRes.json();
      if (requestId !== this.weatherRequestId) return;
      const formatted = this.mapOpenMeteoToWeatherApi(cityName, region, country, lat, lon, raw);
      this.weatherDataSubject.next(formatted);
    } catch (err: any) {
      if (requestId !== this.weatherRequestId) return;
      console.warn('Weather fetch error:', err);
      this.errorSubject.next(err?.message || 'Live weather data is unavailable right now.');
    } finally {
      if (requestId === this.weatherRequestId) {
        this.loadingSubject.next(false);
      }
    }
  }

  /**
   * Fetches real live weather data for geographic coordinates
   */
  public async fetchWeatherByCoords(
    latitude: number,
    longitude: number,
    name = 'Current Location',
    region = 'Local Station',
    country = 'GPS Coordinates'
  ): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      const forecastRes = await fetch(forecastUrl);

      if (!forecastRes.ok) {
        throw new Error('Could not fetch weather for coordinates.');
      }

      const raw = await forecastRes.json();
      const formatted = this.mapOpenMeteoToWeatherApi(name, region, country, latitude, longitude, raw);
      this.weatherDataSubject.next(formatted);
    } catch (err: any) {
      this.errorSubject.next(err.message || 'Location lookup failed');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Converts Open-Meteo live API response to standard WeatherApiResponse
   */
  private mapOpenMeteoToWeatherApi(
    name: string,
    region: string,
    country: string,
    lat: number,
    lon: number,
    raw: any
  ): WeatherApiResponse {
    const cur = raw.current || {};
    const daily = raw.daily || { time: [] };
    const hourly = raw.hourly || { time: [] };

    const tempC = Math.round(cur.temperature_2m ?? 24);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const feelsC = Math.round(cur.apparent_temperature ?? tempC);
    const feelsF = Math.round((feelsC * 9) / 5 + 32);
    const windKph = Math.round(cur.wind_speed_10m ?? 14);
    const windMph = Math.round(windKph * 0.621371);
    const windDir = this.degreesToCompass(cur.wind_direction_10m ?? 0);
    const wCode = cur.weather_code ?? 0;
    const isDay = cur.is_day ?? 1;
    const condition = this.wmoCodeToCondition(wCode, isDay);

    const now = new Date();
    const providerTime = typeof cur.time === 'string' ? cur.time : '';
    const dateFormatted = providerTime ? providerTime.split('T')[0] : now.toISOString().split('T')[0];
    const timeFormatted = providerTime ? providerTime.replace('T', ' ') : `${dateFormatted} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Build 7-day forecast items
    const forecastDays: any[] = [];
    const numDays = Math.min(7, (daily.time || []).length);

    for (let i = 0; i < numDays; i++) {
      const dDate = daily.time[i];
      const maxC = Math.round(daily.temperature_2m_max?.[i] ?? tempC + 3);
      const maxF = Math.round((maxC * 9) / 5 + 32);
      const minC = Math.round(daily.temperature_2m_min?.[i] ?? tempC - 4);
      const minF = Math.round((minC * 9) / 5 + 32);
      const dayCode = daily.weather_code?.[i] ?? 0;
      const dayCond = this.wmoCodeToCondition(dayCode, 1);
      const uv = Math.round((daily.uv_index_max?.[i] ?? 6) * 10) / 10;
      const precipMm = daily.precipitation_sum?.[i] ?? 0;
      const sunrise = daily.sunrise?.[i] ? daily.sunrise[i].split('T')[1] : '06:00 AM';
      const sunset = daily.sunset?.[i] ? daily.sunset[i].split('T')[1] : '07:30 PM';

      // 24 hours of hourly data for day 0 / each day
      const dayHours: any[] = [];
      const startIdx = i * 24;
      for (let h = 0; h < 24; h++) {
        const hIdx = startIdx + h;
        if (hIdx < hourly.time.length) {
          const hTempC = Math.round(hourly.temperature_2m?.[hIdx] ?? tempC);
          const hTempF = Math.round((hTempC * 9) / 5 + 32);
          const hCode = hourly.weather_code?.[hIdx] ?? 0;
          const hIsDay = h >= 6 && h <= 19 ? 1 : 0;
          const hCond = this.wmoCodeToCondition(hCode, hIsDay);
          const hTime = hourly.time[hIdx].replace('T', ' ');

          dayHours.push({
            time_epoch: Math.floor(now.getTime() / 1000) + hIdx * 3600,
            time: hTime,
            temp_c: hTempC,
            temp_f: hTempF,
            is_day: hIsDay,
            condition: hCond,
            wind_kph: Math.round(hourly.wind_speed_10m?.[hIdx] ?? 12),
            wind_dir: windDir,
            humidity: Math.round(hourly.relative_humidity_2m?.[hIdx] ?? 50),
            chance_of_rain: precipMm > 0 ? 60 : 5,
          });
        }
      }

      forecastDays.push({
        date: dDate,
        date_epoch: Math.floor(new Date(dDate).getTime() / 1000),
        day: {
          maxtemp_c: maxC,
          maxtemp_f: maxF,
          mintemp_c: minC,
          mintemp_f: minF,
          avgtemp_c: Math.round((maxC + minC) / 2),
          avgtemp_f: Math.round((maxF + minF) / 2),
          maxwind_mph: Math.round((daily.wind_speed_10m_max?.[i] ?? 15) * 0.621371),
          maxwind_kph: Math.round(daily.wind_speed_10m_max?.[i] ?? 15),
          totalprecip_mm: precipMm,
          totalprecip_in: Math.round(precipMm * 0.03937 * 10) / 10,
          avgvis_km: 10,
          avghumidity: cur.relative_humidity_2m ?? 50,
          daily_will_it_rain: precipMm > 0.5 ? 1 : 0,
          daily_chance_of_rain: precipMm > 0.5 ? 75 : 10,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: dayCond,
          uv: uv,
        },
        astro: {
          sunrise: sunrise,
          sunset: sunset,
          moonrise: '08:30 PM',
          moonset: '06:15 AM',
          moon_phase: 'Waxing Gibbous',
          moon_illumination: '78',
        },
        hour: dayHours,
      });
    }

    return {
      location: {
        name: name,
        region: region,
        country: country,
        lat: lat,
        lon: lon,
        tz_id: raw.timezone || 'UTC',
        localtime_epoch: Math.floor(now.getTime() / 1000),
        localtime: timeFormatted,
      },
      current: {
        last_updated: timeFormatted,
        temp_c: tempC,
        temp_f: tempF,
        is_day: isDay,
        condition: condition,
        wind_mph: windMph,
        wind_kph: windKph,
        wind_degree: cur.wind_direction_10m ?? 0,
        wind_dir: windDir,
        pressure_mb: Math.round(cur.surface_pressure ?? 1013),
        pressure_in: Math.round(((cur.surface_pressure ?? 1013) * 0.02953) * 100) / 100,
        precip_mm: cur.precipitation ?? 0,
        precip_in: Math.round((cur.precipitation ?? 0) * 0.03937 * 100) / 100,
        humidity: Math.round(cur.relative_humidity_2m ?? 50),
        cloud: wCode > 0 ? 30 : 0,
        feelslike_c: feelsC,
        feelslike_f: feelsF,
        vis_km: 10,
        vis_miles: 6,
        uv: Math.round((cur.uv_index ?? 5) * 10) / 10,
        gust_mph: Math.round(windMph * 1.3),
        gust_kph: Math.round(windKph * 1.3),
      },
      forecast: {
        forecastday: forecastDays,
      },
    };
  }

  private degreesToCompass(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const val = Math.floor((deg / 22.5) + 0.5);
    return directions[val % 16];
  }

  private normalizeSearchText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');
  }

  private resolveSearchAlias(normalizedQuery: string): string | undefined {
    const alias = Object.entries(this.searchAliases).find(
      ([key]) => this.normalizeSearchText(key) === normalizedQuery
    );
    return alias?.[1];
  }

  private wmoCodeToCondition(code: number, isDay: number) {
    const timeOfDay = isDay ? 'day' : 'night';

    if (code === 0) {
      return {
        text: isDay ? 'Sunny' : 'Clear',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/113.png`,
        code: 1000,
      };
    }
    if (code === 1) {
      return {
        text: 'Mainly Clear',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/116.png`,
        code: 1003,
      };
    }
    if (code === 2) {
      return {
        text: 'Partly Cloudy',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/116.png`,
        code: 1003,
      };
    }
    if (code === 3) {
      return {
        text: 'Overcast',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/122.png`,
        code: 1009,
      };
    }
    if (code === 45 || code === 48) {
      return {
        text: 'Foggy',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/248.png`,
        code: 1030,
      };
    }
    if (code >= 51 && code <= 55) {
      return {
        text: 'Drizzle',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/266.png`,
        code: 1153,
      };
    }
    if (code >= 61 && code <= 65) {
      return {
        text: code === 65 ? 'Heavy Rain' : 'Rain',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/302.png`,
        code: 1189,
      };
    }
    if (code >= 71 && code <= 77) {
      return {
        text: 'Snow',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/338.png`,
        code: 1219,
      };
    }
    if (code >= 80 && code <= 82) {
      return {
        text: 'Rain Showers',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/353.png`,
        code: 1240,
      };
    }
    if (code >= 95) {
      return {
        text: 'Thunderstorm',
        icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/386.png`,
        code: 1273,
      };
    }

    return {
      text: 'Partly Cloudy',
      icon: `https://cdn.weatherapi.com/weather/64x64/${timeOfDay}/116.png`,
      code: 1003,
    };
  }

  private getMockWeather(city: string): WeatherApiResponse {
    const today = new Date();
    const days: any[] = [];

    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
    const isHotCity = ['Cairo', 'Dubai', 'Riyadh', 'Doha', 'Kuwait City', 'Luxor', 'Aswan'].includes(capitalizedCity);
    const baseTemp = isHotCity ? 32 : 21;

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const maxC = baseTemp + 4 + (i % 3);
      const minC = baseTemp - 5 + (i % 2);

      days.push({
        date: dateStr,
        date_epoch: Math.floor(d.getTime() / 1000),
        day: {
          maxtemp_c: maxC,
          maxtemp_f: Math.round((maxC * 9) / 5 + 32),
          mintemp_c: minC,
          mintemp_f: Math.round((minC * 9) / 5 + 32),
          avgtemp_c: Math.round((maxC + minC) / 2),
          avgtemp_f: Math.round(((maxC + minC) / 2 * 9) / 5 + 32),
          maxwind_mph: 12,
          maxwind_kph: 19,
          totalprecip_mm: i % 4 === 0 ? 1.2 : 0,
          totalprecip_in: 0,
          avgvis_km: 10,
          avghumidity: 45 + i * 2,
          daily_will_it_rain: i % 4 === 0 ? 1 : 0,
          daily_chance_of_rain: i % 4 === 0 ? 35 : 5,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: i === 0 ? 'Sunny' : i % 2 === 0 ? 'Partly Cloudy' : 'Clear',
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png',
            code: 1000,
          },
          uv: 7.0,
        },
        astro: {
          sunrise: '06:12 AM',
          sunset: '07:28 PM',
          moonrise: '08:45 PM',
          moonset: '06:30 AM',
          moon_phase: 'Waxing Crescent',
          moon_illumination: '42',
        },
        hour: Array.from({ length: 24 }, (_, h) => {
          const hTempC = baseTemp + Math.sin((h / 24) * Math.PI * 2) * 5;
          return {
            time_epoch: Math.floor(d.getTime() / 1000) + h * 3600,
            time: `${dateStr} ${h.toString().padStart(2, '0')}:00`,
            temp_c: Math.round(hTempC),
            temp_f: Math.round((hTempC * 9) / 5 + 32),
            is_day: h >= 6 && h <= 18 ? 1 : 0,
            condition: {
              text: h >= 6 && h <= 18 ? 'Sunny' : 'Clear',
              icon: `https://cdn.weatherapi.com/weather/64x64/${h >= 6 && h <= 18 ? 'day' : 'night'}/113.png`,
              code: 1000,
            },
            wind_kph: 15,
            wind_dir: 'NNE',
            humidity: 50,
            chance_of_rain: 0,
          };
        }),
      });
    }

    return {
      location: {
        name: capitalizedCity,
        region: 'Metropolitan Region',
        country: 'Global Station',
        lat: 30.0444,
        lon: 31.2357,
        tz_id: 'UTC',
        localtime_epoch: Math.floor(Date.now() / 1000),
        localtime: '2026-08-24 15:00',
      },
      current: {
        last_updated: '2026-08-24 15:00',
        temp_c: baseTemp,
        temp_f: Math.round((baseTemp * 9) / 5 + 32),
        is_day: 1,
        condition: {
          text: 'Sunny',
          icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png',
          code: 1000,
        },
        wind_mph: 11.2,
        wind_kph: 18.0,
        wind_degree: 30,
        wind_dir: 'NNE',
        pressure_mb: 1014,
        pressure_in: 29.94,
        precip_mm: 0,
        precip_in: 0,
        humidity: 45,
        cloud: 5,
        feelslike_c: baseTemp + 1,
        feelslike_f: Math.round(((baseTemp + 1) * 9) / 5 + 32),
        vis_km: 10,
        vis_miles: 6,
        uv: 7.5,
        gust_mph: 15.0,
        gust_kph: 24.1,
      },
      forecast: {
        forecastday: days,
      },
    };
  }
}
