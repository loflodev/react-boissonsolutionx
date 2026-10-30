import type { ContactFormData } from "../type";

export interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

// Kept under the server caps in functions.php (content <= 5000 characters)
export const CONTACT_LIMITS = { fullName: 100, email: 254, message: 4000 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Courriel requis";
  if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return "Adresse courriel invalide";
  }
  return undefined;
};

const validateFullName = (fullName: string): string | undefined => {
  const trimmed = fullName.trim();
  if (!trimmed) return "Nom complet requis";
  if (trimmed.length > CONTACT_LIMITS.fullName) {
    return `Le nom ne peut pas dépasser ${CONTACT_LIMITS.fullName} caractères`;
  }
  return undefined;
};

const validateMessage = (message: string): string | undefined => {
  const trimmed = message.trim();
  if (!trimmed) return "Message requis";
  if (trimmed.length < 10) {
    return "Le message doit contenir au moins 10 caractères";
  }
  if (trimmed.length > CONTACT_LIMITS.message) {
    return `Le message ne peut pas dépasser ${CONTACT_LIMITS.message} caractères`;
  }
  return undefined;
};

export const validateContactForm = (data: ContactFormData): FormErrors => {
  const errors: FormErrors = {
    fullName: validateFullName(data.fullName),
    email: validateEmail(data.email),
    message: validateMessage(data.message),
  };

  // Drop the fields that passed
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== undefined)
  ) as FormErrors;
};
