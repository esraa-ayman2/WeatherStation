import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  public isSubscribed = false;
  public subscribedEmail = '';

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  public subscribeForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(this.emailPattern),
    ]),
  });

  public get emailControl() {
    return this.subscribeForm.get('email');
  }

  public handleSubscribe(): void {
    if (this.subscribeForm.invalid) {
      this.subscribeForm.markAllAsTouched();
      return;
    }

    this.subscribedEmail = this.subscribeForm.value.email || '';
    this.isSubscribed = true;
  }

  public resetSubscribe(): void {
    this.subscribeForm.reset();
    this.isSubscribed = false;
    this.subscribedEmail = '';
  }
}

