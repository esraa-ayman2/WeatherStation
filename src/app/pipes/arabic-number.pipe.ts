import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arabicNumber',
  standalone: true,
})
export class ArabicNumberPipe implements PipeTransform {
  private easternArabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  public transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/\d/g, (digit) => this.easternArabicDigits[parseInt(digit, 10)] || digit);
  }
}
