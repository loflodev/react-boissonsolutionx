import { useState } from "react";
import { SUBMIT_CONTACT_FORM_QUERY } from "../graphql/submitContactFormQuery";
import { submitContactForm } from "../services/homePageService";
import {
  ValidationError,
  type ContactFormData,
  type ContactFormResponse,
} from "../type";
import { useMutation } from "@tanstack/react-query";

interface FormData {
  fullName: string;
  email: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}
const useContactFormQuery = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      submitContactForm(SUBMIT_CONTACT_FORM_QUERY, data),
    onSuccess: (result: ContactFormResponse) => {
      if (result.data && result.data.createContactMessage && !result.errors) {
        setSubmitStatus("success");
        setSubmitMessage("Merci, envoyé !");
        setFormData({ fullName: "", email: "", message: "" });
        setErrors({});
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          "Soumission échouée !"
        );
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setSubmitStatus("error");
      if (error instanceof ValidationError) {
        setSubmitMessage("Please check your form data and try again.");
      } else {
        setSubmitMessage("Failed to send message. Please try again later.");
      }
      console.error("Contact form error:", error);
    },
    retry: (failureCount, error) => {
      if (error instanceof ValidationError) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nom complet requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Courriel requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresse courriel invalide";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message requis";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Reset submit status when user starts typing
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setSubmitMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Reset status before submission
    setSubmitStatus("idle");
    setSubmitMessage("");

    // Trigger the mutation
    mutation.mutate(formData);
  };

  return {
    formData,
    errors,
    submitStatus,
    submitMessage,
    isSubmitting: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    handleInputChange,
    handleSubmit,
    resetForm: () => {
      setFormData({ fullName: "", email: "", message: "" });
      setErrors({});
      setSubmitStatus("idle");
      setSubmitMessage("");
    },
  };
};

export default useContactFormQuery;
