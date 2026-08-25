export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactSubmission extends ContactFormData {
  submittedAt: string;
  referenceId: string;
}
