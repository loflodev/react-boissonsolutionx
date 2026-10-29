import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  primary: "bg-secondary text-dark shadow-sm hover:bg-btn-hover",
  secondary: "bg-red-500 text-white hover:bg-red-600",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  "0": "py-1.5",
  "1": "py-2.5",
  "2": "py-4",
  "4": "py-8",
  "8": "py-16",
};

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
    COLOR_CLASSES[variant],
    fitContent ? "grow" : "",
    "text-lg font-medium",
    btnClass,
    className,
    "rounded-full px-8",
    SIZE_CLASSES[btnSize],
    "cursor-pointer",
    isLoading ? "bg-gray-400 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const button = (
    <button className={buttonClasses} {...buttonProps}>
      <ButtonContent label={label} isLoading={isLoading} flash={flash} />
    </button>
  );

  return asLink && to ? <Link to={to}>{button}</Link> : button;
};

export default Button;
