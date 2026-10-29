import { useState } from "react";
import { SUBMIT_CONTACT_FORM_QUERY } from "../graphql/submitContactFormQuery";
import { submitContactForm } from "../services/homePageService";
import {
  ValidationError,
  type ContactFormData,
  type ContactFormResponse,
} from "../type";
import { useMutation } from "@tanstack/react-query";
import {
  validateContactForm,
  type FormErrors,
} from "../helpers/validateContactForm";

interface FormData {
  fullName: string;
  email: string;
  message: string;
  website: string;
}

const EMPTY_FORM: FormData = {
  fullName: "",
  email: "",
  message: "",
  website: "",
};

const useContactFormQuery = () => {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
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
        setFormData(EMPTY_FORM);
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
        setSubmitMessage("Veuillez vérifier vos informations et réessayer.");
      } else {
        setSubmitMessage("Échec de l’envoi du message. Veuillez réessayer plus tard.");
      }
      console.error("Contact form error:", error);
    },
    // Never retry: a request that timed out may still have been saved,
    // and a retry would send a duplicate message
    retry: false,
  });

  const validateForm = (): boolean => {
    const newErrors = validateContactForm(formData);
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
      setFormData(EMPTY_FORM);
      setErrors({});
      setSubmitStatus("idle");
      setSubmitMessage("");
    },
  };
};

export default useContactFormQuery;
