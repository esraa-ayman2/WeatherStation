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
      text: 'مرحباً بك! أنا مساعدك الذكي للطقس. كيف يمكنني مساعدتك اليوم؟ 🌤️\nHello! I am your smart weather assistant. How can I help you today?',
      timestamp: this.getCurrentTime(),
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
    const trimmed = text.trim();
    if (!trimmed) return;

    const isArabic = this.isArabicText(trimmed);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: this.getCurrentTime(),
      isArabic,
    };
    this.messagesSubject.next([...this.messagesSubject.value, userMessage]);

    setTimeout(async () => {
      const response = await this.generateResponse(trimmed, isArabic);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: this.getCurrentTime(),
        isArabic: response.isArabic,
      };
      this.messagesSubject.next([...this.messagesSubject.value, botMessage]);
    }, 350);
  }

  private async generateResponse(query: string, isArabic: boolean): Promise<{ text: string; isArabic: boolean }> {
    const city = this.extractRequestedCity(query);
    if (city) {
      this.weatherService.fetchWeather(city);
    }

    try {
      let weatherContext = 'No live weather data is loaded.';
      this.weatherService.weatherData$.subscribe((data) => {
        if (data) {
          weatherContext = `Current live weather: ${data.location.name}, ${Math.round(data.current.temp_c)}°C, ${data.current.condition.text}, humidity ${data.current.humidity}%, wind ${Math.round(data.current.wind_kph)} km/h.`;
        }
      }).unsubscribe();

      const messages = this.messagesSubject.value
        .slice(-12)
        .map((message) => ({
          role: message.sender === 'bot' ? 'assistant' : 'user',
          content: message.text,
        }));
      const text = await this.askAi(messages, weatherContext);
      return { text, isArabic };
    } catch (error) {
      return {
        text: isArabic
          ? `تعذر الاتصال بالمساعد: ${error instanceof Error ? error.message : 'تحقق من تشغيل chat-api وإعداد المفتاح.'}`
          : `The assistant connection failed: ${error instanceof Error ? error.message : 'start chat-api and configure the key.'}`,
        isArabic,
      };
    }
  }

  private async askAi(messages: Array<{ role: string; content: string }>, weatherContext: string): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weatherContext, messages }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    if (!data?.text?.trim()) throw new Error('The assistant returned an empty response.');
    return data.text.trim();
  }

  private extractRequestedCity(query: string): string | null {
    const match = query.match(/^(?:check|weather in|forecast for|طقس|جو|الطقس)\s+(.+)$/i);
    return match?.[1]?.trim() || null;
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
