import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  withArrow?: boolean;
  to?: string;
  asLink?: boolean;
  isLoading?: boolean;
  submitStatus?: "idle" | "success" | "error";
  submitMessage?: string;
}

// primary: the one brand-red action per view. secondary: a quiet glass ghost
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-[0_8px_30px_-12px_rgb(224_40_46/0.6)]",
  secondary:
    "border border-white/15 bg-white/[0.04] text-cream hover:bg-white/[0.08] hover:border-white/25 active:bg-white/[0.12]",
};

// Every size keeps a 44px+ touch target
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-5 text-sm",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-8 text-base md:text-lg",
};

// Feedback lives on the press: instant, and released the moment the pointer lifts
const PRESS_CLASSES =
  "transition-[scale,background-color,border-color] duration-150 ease-out active:scale-[0.97]";

// While loading the button is inert, so it gets no variant color or press feedback
const LOADING_CLASSES = "bg-white/10 text-muted cursor-not-allowed";

const FLASH_DURATION_MS = 3000;

interface FlashMessage {
  text: string;
  type: "success" | "error";
}

// Show the submit result for a few seconds, then go back to the label
const useFlashMessage = (
  submitStatus: ButtonProps["submitStatus"],
  submitMessage: string | undefined
) => {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    if (submitStatus !== "success" && submitStatus !== "error") return;

    setFlash({ text: submitMessage || "", type: submitStatus });
    const timer = setTimeout(() => setFlash(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [submitStatus, submitMessage]);

  return flash;
};

const Arrow = () => (
  <ArrowRight
    aria-hidden="true"
    className="size-4 transition-[translate] duration-200 ease-out group-hover:translate-x-0.5"
  />
);

const ButtonContent = ({
  label,
  isLoading,
  flash,
  withArrow,
}: {
  label: string;
  isLoading: boolean;
  flash: FlashMessage | null;
  withArrow: boolean;
}) => {
  if (flash) {
    return (
      <span
        className={flash.type === "success" ? "text-green-100" : "text-red-100"}
      >
        {flash.text}
      </span>
    );
  }

  if (isLoading) {
    return (
      <>
        <span className="animate-spin rounded-full size-4 border-2 border-white/30 border-t-white"></span>
        <span>{label}</span>
      </>
    );
  }

  return (
    <>
      {label}
      {withArrow && <Arrow />}
    </>
  );
};

const Button = ({
  label,
  variant,
  size = "md",
  fullWidth = false,
  withArrow = false,
  to,
  asLink = false,
  isLoading = false,
  submitStatus,
  submitMessage,
  className,
  ...buttonProps
}: ButtonProps) => {
  const flash = useFlashMessage(submitStatus, submitMessage);

  const buttonClasses = [
    "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight",
    isLoading ? LOADING_CLASSES : `${VARIANT_CLASSES[variant]} ${PRESS_CLASSES} cursor-pointer`,
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // A real anchor (not a button wrapped in a link) so it stays valid,
  // crawlable and keyboard-native
  if (asLink && to) {
    return (
      <a href={to} className={buttonClasses}>
        {label}
        {withArrow && <Arrow />}
      </a>
    );
  }

  return (
    <button className={buttonClasses} {...buttonProps}>
      <ButtonContent
        label={label}
        isLoading={isLoading}
        flash={flash}
        withArrow={withArrow}
      />
    </button>
  );
};

export default Button;
