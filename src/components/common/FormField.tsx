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
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  onBlur,
}: FormFieldProps) => {
  const errorId = `${name}-error`;
  const className = `form-input ${fieldClass} ${error ? "border-red-500" : ""}`;
  const fieldProps = {
    id: name,
    name,
    value,
    onChange,
    onBlur,
    className,
    autoComplete,
    required: true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };

  // The error sits outside the <label> so it describes the field
  // (aria-describedby) without also becoming part of its name
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium tracking-tight text-cream/90">
        {label}
      </label>
      {multiline ? (
        <textarea {...fieldProps} />
      ) : (
        <input type={type} {...fieldProps} />
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
