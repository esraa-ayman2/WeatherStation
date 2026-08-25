import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactSubmission } from '../../types';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  @Output() backToHome = new EventEmitter<void>();

  public isSubmitted = false;
  public isSubmitting = false;
  public submissionData: ContactSubmission | null = null;

  // Custom email pattern regex to guarantee valid TLD and standard format
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Phone regex for optional international phone format
  private phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  public contactForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(60),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(this.emailPattern),
    ]),
    phone: new FormControl('', [
      Validators.pattern(this.phonePattern),
    ]),
    subject: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(100),
    ]),
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(1000),
    ]),
  });

  public get nameControl() {
    return this.contactForm.get('name');
  }

  public get emailControl() {
    return this.contactForm.get('email');
  }

  public get phoneControl() {
    return this.contactForm.get('phone');
  }

  public get subjectControl() {
    return this.contactForm.get('subject');
  }

  public get messageControl() {
    return this.contactForm.get('message');
  }

  public onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      const formVal = this.contactForm.value;
      this.submissionData = {
        name: formVal.name || '',
        email: formVal.email || '',
        subject: formVal.subject || 'General Meteorological Inquiry',
        message: formVal.message || '',
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        referenceId: `MET-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      this.isSubmitting = false;
      this.isSubmitted = true;
    }, 500);
  }

  public resetForm(): void {
    this.contactForm.reset();
    this.isSubmitted = false;
    this.submissionData = null;
  }

  public onBack(): void {
    this.backToHome.emit();
  }
}

