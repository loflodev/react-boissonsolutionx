interface FormFieldProps {
  name: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  fieldClass?: string;
  autoComplete?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const FormField = ({
  name,
  label,
  value,
  error,
  type,
  multiline = false,
  fieldClass = "",
  autoComplete,
  onChange,
}: FormFieldProps) => {
  const errorId = `${name}-error`;
  const className = `form-input ${fieldClass} ${error ? "border-red-500" : ""}`;
  const fieldProps = {
    id: name,
    name,
    value,
    onChange,
    className,
    autoComplete,
    required: true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <label htmlFor={name} className="flex flex-col gap-2">
      {label}
      {multiline ? (
        <textarea {...fieldProps} />
      ) : (
        <input type={type} {...fieldProps} />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </label>
  );
};

export default FormField;
