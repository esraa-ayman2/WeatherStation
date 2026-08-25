import { Directive, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRtlDetector]',
  standalone: true,
})
export class RtlDetectorDirective implements OnInit {
  private arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  public ngOnInit(): void {
    this.checkDirection(this.el.nativeElement.textContent || (this.el.nativeElement as HTMLInputElement).value || '');
  }

  @HostListener('input', ['$event.target.value'])
  public onInput(value: string): void {
    this.checkDirection(value);
  }

  private checkDirection(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {
      this.renderer.removeAttribute(this.el.nativeElement, 'dir');
      return;
    }

    if (this.arabicPattern.test(trimmed)) {
      this.renderer.setAttribute(this.el.nativeElement, 'dir', 'rtl');
      this.renderer.setStyle(this.el.nativeElement, 'text-align', 'right');
    } else {
      this.renderer.setAttribute(this.el.nativeElement, 'dir', 'ltr');
      this.renderer.setStyle(this.el.nativeElement, 'text-align', 'left');
    }
  }
}
