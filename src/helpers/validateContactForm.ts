import type { ContactFormData } from "../type";

export interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Courriel requis";
  if (!EMAIL_PATTERN.test(email)) return "Adresse courriel invalide";
  return undefined;
};

const validateMessage = (message: string): string | undefined => {
  const trimmed = message.trim();
  if (!trimmed) return "Message requis";
  if (trimmed.length < 10) {
    return "Le message doit contenir au moins 10 caractères";
  }
  return undefined;
};

export const validateContactForm = (data: ContactFormData): FormErrors => {
  const errors: FormErrors = {
    fullName: data.fullName.trim() ? undefined : "Nom complet requis",
    email: validateEmail(data.email),
    message: validateMessage(data.message),
  };

  // Drop the fields that passed
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== undefined)
  ) as FormErrors;
};
