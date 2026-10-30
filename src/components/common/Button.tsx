import { useEffect, useState } from "react";

type ButtonColoType = "primary" | "secondary";
type ButtonSize = "0" | "1" | "2" | "4" | "8";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant: ButtonColoType;
  fitContent?: boolean;
  btnClass?: string;
  btnSize?: ButtonSize;
  to?: string;
  asLink?: boolean;
  isLoading?: boolean;
  submitStatus?: "idle" | "success" | "error";
  submitMessage?: string;
}

const COLOR_CLASSES: Record<ButtonColoType, string> = {
  primary: "bg-secondary text-dark shadow-sm hover:bg-btn-hover active:bg-btn-active",
  secondary: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  "0": "py-1.5",
  "1": "py-2.5",
  "2": "py-4",
  "4": "py-8",
  "8": "py-16",
};

// Feedback lives on the press: instant, and released the moment the pointer lifts
const PRESS_CLASSES =
  "transition-[scale,background-color] duration-100 ease-out active:scale-[0.97]";

// While loading the button is inert, so it gets no variant color or press feedback
const LOADING_CLASSES = "bg-gray-400 text-white cursor-not-allowed";

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

const ButtonContent = ({
  label,
  isLoading,
  flash,
}: {
  label: string;
  isLoading: boolean;
  flash: FlashMessage | null;
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
      <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>{label}</span>
      </div>
    );
  }

  return label;
};

const Button = ({
  label,
  variant,
  fitContent = true,
  btnClass,
  btnSize = "1",
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
    isLoading ? LOADING_CLASSES : `${COLOR_CLASSES[variant]} ${PRESS_CLASSES} cursor-pointer`,
    fitContent ? "grow" : "",
    "text-lg font-medium",
    btnClass,
    className,
    "rounded-full px-8",
    SIZE_CLASSES[btnSize],
  ]
    .filter(Boolean)
    .join(" ");

  // A real anchor (not a button wrapped in a link) so it stays valid,
  // crawlable and keyboard-native
  if (asLink && to) {
    return (
      <a href={to} className={`${buttonClasses} inline-block text-center`}>
        {label}
      </a>
    );
  }

  return (
    <button className={buttonClasses} {...buttonProps}>
      <ButtonContent label={label} isLoading={isLoading} flash={flash} />
    </button>
  );
};

export default Button;
