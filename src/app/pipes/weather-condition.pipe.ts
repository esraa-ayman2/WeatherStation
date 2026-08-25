import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weatherCondition',
  standalone: true,
})
export class WeatherConditionPipe implements PipeTransform {
  private translations: Record<string, string> = {
    'Sunny': 'مشمس',
    'Clear': 'صافٍ',
    'Partly cloudy': 'غائم جزئياً',
    'Cloudy': 'غائم',
    'Overcast': 'ملبد بالغيوم',
    'Mist': 'ضباب خفيف',
    'Fog': 'ضباب كثيف',
    'Patchy rain possible': 'أمطار متفرقة محتملة',
    'Patchy snow possible': 'ثلوج متفرقة محتملة',
    'Patchy sleet possible': 'برد خفيف محتمل',
    'Patchy freezing drizzle possible': 'رذاذ متجمد محتمل',
    'Thundery outbreaks possible': 'عواصف رعدية محتملة',
    'Blowing snow': 'ثلوج متطايرة',
    'Blizzard': 'عاصفة ثلجية',
    'Light drizzle': 'رذاذ خفيف',
    'Freezing drizzle': 'رذاذ متجمد',
    'Heavy freezing drizzle': 'رذاذ متجمد كثيف',
    'Patchy light rain': 'أمطار خفيفة متفرقة',
    'Light rain': 'أمطار خفيفة',
    'Moderate rain at times': 'أمطار معتدلة أحياناً',
    'Moderate rain': 'أمطار معتدلة',
    'Heavy rain at times': 'أمطار غزيرة أحياناً',
    'Heavy rain': 'أمطار غزيرة',
    'Light freezing rain': 'أمطار متجمدة خفيفة',
    'Moderate or heavy freezing rain': 'أمطار متجمدة معتدلة إلى غزيرة',
    'Light sleet': 'برد خفيف',
    'Moderate or heavy sleet': 'برد معتدل إلى كثيف',
    'Patchy light snow': 'ثلوج خفيفة متفرقة',
    'Light snow': 'ثلوج خفيفة',
    'Patchy moderate snow': 'ثلوج معتدلة متفرقة',
    'Moderate snow': 'ثلوج معتدلة',
    'Patchy heavy snow': 'ثلوج كثيفة متفرقة',
    'Heavy snow': 'ثلوج كثيفة',
    'Ice pellets': 'حبات جليدية',
    'Light rain shower': 'زخات مطر خفيفة',
    'Moderate or heavy rain shower': 'زخات مطر معتدلة إلى غزيرة',
    'Torrential rain shower': 'زخات مطر طوفانية',
    'Light sleet showers': 'زخات برد خفيفة',
    'Moderate or heavy sleet showers': 'زخات برد معتدلة إلى كثيفة',
    'Light snow showers': 'زخات ثلجية خفيفة',
    'Moderate or heavy snow showers': 'زخات ثلجية معتدلة إلى كثيفة',
    'Light showers of ice pellets': 'زخات حبات جليد خفيفة',
    'Moderate or heavy showers of ice pellets': 'زخات حبات جليد معتدلة إلى كثيفة',
    'Patchy light rain with thunder': 'أمطار خفيفة متفرقة مع رعد',
    'Moderate or heavy rain with thunder': 'أمطار معتدلة إلى غزيرة مع رعد',
    'Patchy light snow with thunder': 'ثلوج خفيفة متفرقة مع رعد',
    'Moderate or heavy snow with thunder': 'ثلوج معتدلة إلى كثيفة مع رعد',
  };

  public transform(value: string | null | undefined, lang: 'en' | 'ar' | 'both' = 'en'): string {
    if (!value) return '';
    const trimmed = value.trim();
    const ar = this.translations[trimmed] || trimmed;

    if (lang === 'ar') {
      return ar;
    }
    if (lang === 'both') {
      return ar !== trimmed ? `${trimmed} (${ar})` : trimmed;
    }
    return trimmed;
  }
}
