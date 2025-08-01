import { Link } from "react-router-dom";

type ButtonColoType = "primary" | "secondary";
type ButtonSize = "0" | "1" | "2" | "4" | "8";

interface Button {
  label: string;
  variant: ButtonColoType;
  onClick?: () => void;
  fitContent?: boolean;
  btnClass?: string;
  btnSize?: ButtonSize;
}

const Button = ({
  label,
  onClick,
  variant,
  fitContent = true,
  btnClass,
  btnSize = "1",
  ...rest
}: Button) => {
  const fit = fitContent ? "grow" : "";
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

  const btnDefault = btnClass ? btnClass : "text-lg font-medium";

  return (
    <Link to="/#contactForm">
      <div className="flex">
        <button
          className={`${colorOptions[variant]} ${fit} ${btnDefault} rounded-full px-8 ${size[btnSize]}  cursor-pointer ${btnClass}`}
          onClick={onClick}
          {...rest}
        >
          {label}
        </button>
      </div>
    </Link>
  );
};

export default Button;
