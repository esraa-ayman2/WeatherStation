import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  public userInput = '';
  public messages: ChatMessage[] = [];
  public isOpen = false;

  constructor(public chatbotService: ChatbotService) {
    this.chatbotService.messages$.subscribe((msgs) => {
      this.messages = msgs;
    });
    this.chatbotService.isOpen$.subscribe((open) => {
      this.isOpen = open;
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  public toggleChat(): void {
    this.chatbotService.toggleChat();
  }

  public closeChat(): void {
    this.chatbotService.closeChat();
  }

  public sendMessage(): void {
    if (this.userInput.trim()) {
      this.chatbotService.sendMessage(this.userInput);
      this.userInput = '';
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Ignored
    }
  }
}

