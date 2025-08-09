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
  const fit = fitContent ? "grow" : "";
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "error") {
      setShowMessage(true);
      setMessage(submitMessage || "");
      setMessageType(submitStatus);

      const timer = setTimeout(() => {
        setShowMessage(false);
        setMessage("");
      }, 3000); // Show message for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [submitStatus, submitMessage]);

  const colorOptions: Record<ButtonColoType, string> = {
    primary: "bg-secondary text-dark shadow-sm hover:bg-btn-hover",
    secondary: "bg-red-500 text-white hover:bg-red-600",
  };

  const size: Record<ButtonSize, string> = {
    "0": "py-1.5",
    "1": "py-2.5",
    "2": "py-4",
    "4": "py-8",
    "8": "py-16",
  };

  const btnDefault = "text-lg font-medium";

  const buttonClasses = `
    ${colorOptions[variant]} 
    ${fit} 
    ${btnDefault} 
    ${btnClass || ""} 
    ${className || ""} 
    rounded-full px-8 
    ${size[btnSize]} 
    cursor-pointer
    ${isLoading ? "bg-gray-400  cursor-not-allowed" : ""}
  `
    .replace(/\s+/g, " ")
    .trim();

  const getButtonContent = () => {
    if (showMessage) {
      return (
        <span
          className={`${
            messageType === "success" ? "text-green-100" : "text-red-100"
          }`}
        >
          {message}
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

  const content = getButtonContent();

  if (asLink && to) {
    return (
      <Link to={to}>
        <button className={buttonClasses} {...buttonProps}>
          {content}
        </button>
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...buttonProps}>
      {content}
    </button>
  );
};

export default Button;
