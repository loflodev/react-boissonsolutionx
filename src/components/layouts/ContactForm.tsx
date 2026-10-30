import { CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { CONTACT_LIMITS } from "../../helpers/validateContactForm";
import useContactFormQuery from "../../hooks/useContactFormQuery";
import Button from "../common/Button";
import { Glow, Grain, Rings } from "../common/Decor";
import FormField from "../common/FormField";
import Section from "../common/Section";

export interface Inquiry {
  product: string;
  // Distinguishes two clicks on the same product, so each one prefills again
  at: number;
}

const inquiryMessage = (product: string) =>
  `Bonjour, j'aimerais avoir plus d'informations sur ${product}. `;

const SentConfirmation = ({ onReset }: { onReset: () => void }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The form the visitor was in is gone; move focus to what replaced it
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-start gap-5 max-w-2xl rounded-3xl border border-line bg-white/[0.02] p-6 md:p-10 motion-safe:animate-fade-in">
      <span className="grid size-12 place-items-center rounded-full bg-secondary/10 text-secondary ring-1 ring-secondary/20">
        <CircleCheck size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="display text-cream text-3xl outline-none">
        Merci, message envoyé !
      </h3>
      <p className="text-muted leading-relaxed">
        Nous avons bien reçu votre message. Notre équipe vous répondra très bientôt.
      </p>
      <Button
        label="Envoyer un autre message"
        variant="secondary"
        size="md"
        className="mt-2"
        onClick={onReset}
      />
    </div>
  );
};

const ContactForm = ({ inquiry }: { inquiry?: Inquiry | null }) => {
  const {
    formData,
    errors,
    submitStatus,
    submitMessage,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
    prefillMessage,
    resetForm,
  } = useContactFormQuery();

  // Last message we wrote ourselves: it can be replaced, but the visitor's own text never is
  const lastPrefill = useRef("");

  useEffect(() => {
    if (!inquiry) return;
    const current = formData.message.trim();
    if (current && current !== lastPrefill.current.trim()) return;
    lastPrefill.current = inquiryMessage(inquiry.product);
    prefillMessage(lastPrefill.current);
    // Only a new inquiry should prefill, not every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry]);

  return (
    <Section
      tone="raised"
      eyebrow="04 — Nous contacter"
      sectionTitle="Nous Contacter"
      id="contactForm"
      decor={
        <>
          <Glow color="secondary" className="right-[5%] top-1/3 size-[30rem]" />
          {/* Rings fill the empty side of the form; on phones there is none, so they stay hidden */}
          <Rings className="hidden md:block top-1/2 -translate-y-1/2 w-[56rem] md:right-[-22rem] lg:right-[-4rem]" />
          <Grain />
        </>
      }
    >
      {submitStatus === "success" ? (
        <SentConfirmation onReset={resetForm} />
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 max-w-2xl rounded-3xl border border-line bg-white/[0.02] p-6 md:p-10"
        >
          <FormField
            name="fullName"
            label="Nom Complet *"
            autoComplete="name"
            value={formData.fullName}
            maxLength={CONTACT_LIMITS.fullName}
            error={errors.fullName}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          <FormField
            name="email"
            type="email"
            label="Courriel *"
            autoComplete="email"
            value={formData.email}
            maxLength={CONTACT_LIMITS.email}
            error={errors.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          <FormField
            name="message"
            label="Message *"
            multiline
            fieldClass="h-44 resize-y"
            value={formData.message}
            maxLength={CONTACT_LIMITS.message}
            error={errors.message}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          {/* Honeypot: hidden from people, filled by bots */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            asLink={false}
            label="Envoyer ton message"
            variant="primary"
            size="lg"
            fullWidth
            withArrow
            className="mt-2"
            isLoading={isSubmitting}
            submitStatus={submitStatus}
            submitMessage={submitMessage}
          />
        </form>
      )}

      {/* Lives outside the form so the success announcement survives the swap */}
      <p role="status" aria-live="polite" className="sr-only">
        {submitStatus !== "idle" ? submitMessage : ""}
      </p>
    </Section>
  );
};

export default ContactForm;
