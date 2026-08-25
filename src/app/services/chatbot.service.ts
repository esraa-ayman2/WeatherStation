import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../interfaces';
import { WeatherService } from './weather.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Hello! 🌤️ I am your Weather Assistant. You can chat with me in English or Arabic (أهلاً بك! يمكنك التحدث معي بالعربية أو الإنجليزية).',
      timestamp: this.getCurrentTime(),
      quickReplies: [
        'What to wear today? / ماذا أرتدي؟',
        'Will it rain? / هل ستمطر؟',
        'Check Cairo / طقس القاهرة',
        'Check Dubai / طقس دبي',
        'UV Index / نصيحة الشمس',
      ],
      isArabic: false,
    },
  ]);
  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  constructor(private weatherService: WeatherService) {}

  public toggleChat(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  public openChat(): void {
    this.isOpenSubject.next(true);
  }

  public closeChat(): void {
    this.isOpenSubject.next(false);
  }

  public isArabicText(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  public sendMessage(text: string): void {
    if (!text.trim()) return;

    const trimmed = text.trim();
    const isArabic = this.isArabicText(trimmed);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: this.getCurrentTime(),
      isArabic,
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMsg]);

    setTimeout(() => {
      const botResponse = this.generateResponse(trimmed, isArabic);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        timestamp: this.getCurrentTime(),
        quickReplies: botResponse.quickReplies,
        isArabic: botResponse.isArabic,
      };
      this.messagesSubject.next([...this.messagesSubject.value, botMsg]);
    }, 450);
  }

  private generateResponse(
    query: string,
    isArabic: boolean
  ): { text: string; quickReplies?: string[]; isArabic: boolean } {
    const q = query.toLowerCase().trim();

    // Get current weather context if available
    let currentCity = 'Cairo';
    let currentTempC = 28;
    let feelsLikeC = 29;
    let conditionText = 'Sunny';
    let rainChance = 10;
    let humidity = 45;
    let windKph = 18;
    let uvIndex = 6;

    // Read current state from service if loaded
    this.weatherService.weatherData$.subscribe((data) => {
      if (data) {
        currentCity = data.location.name;
        currentTempC = Math.round(data.current.temp_c);
        feelsLikeC = Math.round(data.current.feelslike_c);
        conditionText = data.current.condition.text;
        humidity = data.current.humidity;
        windKph = Math.round(data.current.wind_kph);
        uvIndex = data.current.uv;
        if (data.forecast?.forecastday?.[0]?.day) {
          rainChance = data.forecast.forecastday[0].day.daily_chance_of_rain || 0;
        }
      }
    });

    // ==========================================
    // ARABIC LANGUAGE HANDLING
    // ==========================================
    if (isArabic) {
      // Check city requests in Arabic (e.g. طقس القاهرة, الرياض, دبي, الاسكندرية, إلخ)
      const cityKeywords = ['طقس', 'جو', 'درجة حرارة في', 'في مدينة', 'عن'];
      let potentialCity = q;
      for (const kw of cityKeywords) {
        potentialCity = potentialCity.replace(kw, '').trim();
      }

      // Check if user requested a specific city
      const resolved = this.weatherService.resolveCityName(potentialCity || q);
      if (
        resolved !== potentialCity &&
        (q.includes('طقس') || q.includes('جو') || potentialCity.length > 2)
      ) {
        this.weatherService.fetchWeather(potentialCity);
        return {
          text: `تم تحديث لوحة الطقس لمدينة "${resolved}" بنجاح! 🌍 يمكنك الآن مشاهدة التوقعات اللحظية وقياسات المحطة على الشاشة الرئيسية.`,
          quickReplies: ['ماذا أرتدي اليوم؟', 'هل ستمطر؟', 'نصيحة الأشعة فوق البنفسجية'],
          isArabic: true,
        };
      }

      // Greetings
      if (
        q.includes('مرحبا') ||
        q.includes('أهلا') ||
        q.includes('اهلا') ||
        q.includes('السلام عليكم') ||
        q.includes('صباح الخير') ||
        q.includes('مساء الخير') ||
        q.includes('هاي') ||
        q.includes('هلا')
      ) {
        return {
          text: `أهلاً ومرحباً بك! 👋 أنا مساعدك الجوي الذكي. يمكنك سؤالي عن فرص سقوط الأمطار، حالة الطقس الحالية، نصائح الملابس المناسبة، أو البحث عن أي مدينة في العالم!`,
          quickReplies: ['درجة الحرارة الآن؟', 'هل ستمطر اليوم؟', 'ماذا أرتدي؟', 'طقس القاهرة', 'طقس دبي'],
          isArabic: true,
        };
      }

      // Rain & Storms
      if (
        q.includes('مطر') ||
        q.includes('امطار') ||
        q.includes('أمطار') ||
        q.includes('شتاء') ||
        q.includes('عاصف') ||
        q.includes('غيوم') ||
        q.includes('سحاب')
      ) {
        const rainMsg =
          rainChance > 40
            ? `🌧️ فرصة هطول الأمطار اليوم في ${currentCity} مرتفعة بنسبة (${rainChance}%). يُنصح بأخذ مظلة أو ارتداء سترة واقية من الماء!`
            : `☀️ فرصة هطول الأمطار اليوم في ${currentCity} منخفضة جداً (${rainChance}%). الأجواء مستقرة ومناسبة للأنشطة الخارجية!`;

        return {
          text: rainMsg,
          quickReplies: ['ماذا أرتدي اليوم؟', 'كم درجة الحرارة؟', 'طقس الإسكندرية'],
          isArabic: true,
        };
      }

      // Temperature & Current Condition
      if (
        q.includes('حرارة') ||
        q.includes('درجة') ||
        q.includes('الجو عامل ايه') ||
        q.includes('الطقس') ||
        q.includes('اليوم')
      ) {
        return {
          text: `🌡️ درجة الحرارة الحالية في ${currentCity} هي ${currentTempC}°C (الإحساس الفعلي: ${feelsLikeC}°C)، والطقس ${conditionText}. نسبة الرطوبة ${humidity}% وسرعة الرياح ${windKph} كم/س.`,
          quickReplies: ['ماذا أرتدي اليوم؟', 'هل ستمطر؟', 'نصيحة الأشعة'],
          isArabic: true,
        };
      }

      // Clothing Advice
      if (
        q.includes('ارتدي') ||
        q.includes('أرتدي') ||
        q.includes('البس') ||
        q.includes('ألبس') ||
        q.includes('لبس') ||
        q.includes('ملابس') ||
        q.includes('برد') ||
        q.includes('حر')
      ) {
        let advice = '';
        if (currentTempC >= 25) {
          advice = `👕 الجو دافئ (${currentTempC}°C). يُنصح بارتداء ملابس قطنية خفيفة ومريحة مع نظارة شمسية وشرب كميات كافية من المياه!`;
        } else if (currentTempC >= 18) {
          advice = `🧥 الأجواء معتدلة لطيفة (${currentTempC}°C). سترة قطنية خفيفة أو قميص بأكمام مناسبة جداً خلال المساء.`;
        } else {
          advice = `🧣 الأجواء مائلة للبرودة (${currentTempC}°C). ننصح بارتداء معطف دافئ أو جاكيت واقٍ من الهواء خاصة أثناء الليل.`;
        }
        return {
          text: advice,
          quickReplies: ['هل ستمطر؟', 'كم درجة الحرارة؟', 'طقس الرياض'],
          isArabic: true,
        };
      }

      // UV & Sun Protection
      if (
        q.includes('شمس') ||
        q.includes('اشعة') ||
        q.includes('أشعة') ||
        q.includes('واقي') ||
        q.includes('uv')
      ) {
        let uvTip = '';
        if (uvIndex <= 3) {
          uvTip = `☀️ مؤشر الأشعة فوق البنفسجية منخفض (${uvIndex}). لا توجد مخاطر إشعاعية تذكر.`;
        } else if (uvIndex <= 7) {
          uvTip = `☀️ مؤشر الأشعة فوق البنفسجية متوسط إلى مرتفع (${uvIndex}). يُفضل وضع واقي شمس SPF 30+ وارتداء نظارة شمسية في أوقات الظهيرة.`;
        } else {
          uvTip = `⚠️ مؤشر الأشعة شديد (${uvIndex})! تجنب التعرض المباشر لأشعة الشمس بين الساعة 11 صباحاً و 3 عصراً.`;
        }
        return {
          text: uvTip,
          quickReplies: ['ماذا أرتدي؟', 'هل ستمطر؟', 'طقس القاهرة'],
          isArabic: true,
        };
      }

      // Wind & Humidity
      if (q.includes('رياح') || q.includes('رطوبة') || q.includes('هواء') || q.includes('عاصفة')) {
        return {
          text: `💨 سرعة الرياح الحالية في ${currentCity} تبلغ ${windKph} كم/س والرطوبة الجوية ${humidity}%. حركة الهواء معتدلة ومستقرة.`,
          quickReplies: ['هل ستمطر اليوم؟', 'ماذا أرتدي؟', 'طقس دبي'],
          isArabic: true,
        };
      }

      // Arabic Default Fallback
      return {
        text: `أهلاً بك! يمكنك الاستفسار عن تفاصيل الطقس في ${currentCity}، أو معرفة الملابس المناسبة، أو كتابة اسم أي مدينة للبحث عنها فوراً.`,
        quickReplies: ['ماذا أرتدي اليوم؟', 'هل ستمطر؟', 'طقس القاهرة', 'طقس الرياض'],
        isArabic: true,
      };
    }

    // ==========================================
    // ENGLISH LANGUAGE HANDLING
    // ==========================================

    // Check for city requests in English
    if (
      q.startsWith('check ') ||
      q.startsWith('weather in ') ||
      q.startsWith('forecast for ') ||
      q.includes('cairo') ||
      q.includes('london') ||
      q.includes('tokyo') ||
      q.includes('paris') ||
      q.includes('new york') ||
      q.includes('dubai') ||
      q.includes('riyadh')
    ) {
      let city = q.replace(/(check|weather in|forecast for)/gi, '').trim();
      const resolved = this.weatherService.resolveCityName(city || q);
      this.weatherService.fetchWeather(resolved);
      return {
        text: `Searching live meteorological telemetry for "${resolved}" now! The dashboard has been updated. 🛰️`,
        quickReplies: ['Will it rain?', 'What to wear?', 'UV Index Advice'],
        isArabic: false,
      };
    }

    if (q.includes('rain') || q.includes('umbrella') || q.includes('storm')) {
      const rainMsg =
        rainChance > 40
          ? `🌧️ The chance of precipitation today in ${currentCity} is ${rainChance}%. Carrying an umbrella or water-resistant jacket is recommended!`
          : `☀️ The chance of rain in ${currentCity} is currently low (${rainChance}%). Great conditions for outdoor travel!`;

      return {
        text: rainMsg,
        quickReplies: ['What to wear today?', 'Check London', 'UV Index Advice'],
        isArabic: false,
      };
    }

    if (q.includes('wear') || q.includes('clothes') || q.includes('outfit')) {
      let advice = '';
      if (currentTempC >= 25) {
        advice = `👕 Dressing Tip: Warm conditions (${currentTempC}°C). Breathable cotton garments, sunglasses, and hydration are ideal!`;
      } else if (currentTempC >= 18) {
        advice = `🧥 Dressing Tip: Mild conditions (${currentTempC}°C). A comfortable light sweater or long sleeves work great for the evening.`;
      } else {
        advice = `🧣 Dressing Tip: Cool weather (${currentTempC}°C). Layer up with a jacket or windbreaker to stay comfortable.`;
      }
      return {
        text: advice,
        quickReplies: ['Will it rain?', 'UV Index Advice', 'Check Cairo'],
        isArabic: false,
      };
    }

    if (q.includes('temp') || q.includes('temperature') || q.includes('how is the weather')) {
      return {
        text: `🌡️ Current temperature in ${currentCity} is ${currentTempC}°C (Feels like: ${feelsLikeC}°C) with ${conditionText}. Humidity is ${humidity}% and wind speed is ${windKph} km/h.`,
        quickReplies: ['What to wear today?', 'Will it rain?', 'Check Dubai'],
        isArabic: false,
      };
    }

    if (q.includes('uv') || q.includes('sun') || q.includes('sunscreen')) {
      return {
        text: `☀️ UV Protection Tip: UV index in ${currentCity} is ${uvIndex}. ${
          uvIndex >= 6
            ? 'SPF 30+ sunscreen and protective eyewear recommended during peak daytime hours.'
            : 'Low to moderate exposure risk.'
        }`,
        quickReplies: ['What to wear today?', 'Will it rain?', 'Check Dubai'],
        isArabic: false,
      };
    }

    if (q.includes('wind') || q.includes('breeze') || q.includes('gust')) {
      return {
        text: `💨 Wind Info: Wind speed in ${currentCity} is currently ${windKph} km/h with humidity at ${humidity}%.`,
        quickReplies: ['Check New York', 'Check Tokyo', 'Will it rain?'],
        isArabic: false,
      };
    }

    if (
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey') ||
      q.includes('help')
    ) {
      return {
        text: 'Hello there! 👋 I am your meteorological assistant. Ask me about rain chances, clothing recommendations, UV exposure, or type any city name in English or Arabic!',
        quickReplies: ['What to wear today?', 'Will it rain?', 'Check Cairo', 'Check Paris'],
        isArabic: false,
      };
    }

    // Default English response
    return {
      text: `Understood! You can explore live forecasts on the dashboard for ${currentCity}, ask me about clothing & rain, or query any city worldwide in English or Arabic.`,
      quickReplies: ['What to wear today?', 'Will it rain?', 'Check Cairo', 'Check London'],
      isArabic: false,
    };
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

