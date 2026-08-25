import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  @Input('appAutoFocus') public shouldFocus: boolean = true;

  constructor(private el: ElementRef<HTMLElement>) {}

  public ngAfterViewInit(): void {
    if (this.shouldFocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 50);
    }
  }
}
