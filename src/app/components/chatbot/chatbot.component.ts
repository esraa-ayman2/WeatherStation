import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services';
import { ChatMessage } from '../../interfaces';
import { RtlDetectorDirective } from '../../directives/rtl-detector.directive';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RtlDetectorDirective],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;
  private lastMessageCount = 0;

  public userInput = '';
  public messages: ChatMessage[] = [];
  public isOpen = false;

  public isLoading = false;
  public loadingText = 'جاري التفكير...';

  constructor(public chatbotService: ChatbotService) {
    this.chatbotService.messages$.subscribe((msgs) => {
      this.messages = msgs;
      if (msgs.length > 0 && msgs[msgs.length - 1].sender === 'bot') {
        this.isLoading = false;
      }
    });
    
    this.chatbotService.isOpen$.subscribe((open) => {
      this.isOpen = open;
    });
    
  }

  ngAfterViewChecked(): void {
    if (this.messages.length !== this.lastMessageCount) {
      this.lastMessageCount = this.messages.length;
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    }
  }

  public toggleChat(): void {
    this.chatbotService.toggleChat();
  }

  public closeChat(): void {
    this.chatbotService.closeChat();
  }

  public sendMessage(): void {
    if (this.userInput.trim() && !this.isLoading) {
      const isArabic = /[\u0600-\u06FF]/.test(this.userInput);
      this.loadingText = isArabic ? 'جاري التفكير...' : 'Thinking...';
      this.isLoading = true;
      this.chatbotService.sendMessage(this.userInput);
      this.userInput = '';
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    } catch {
      // Ignored
    }
  }
}

