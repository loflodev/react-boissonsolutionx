interface FormFieldProps {
  name: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  fieldClass?: string;
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
  onChange,
}: FormFieldProps) => {
  const className = `form-input ${fieldClass} ${error ? "border-red-500" : ""}`;
  const fieldProps = { id: name, name, value, onChange, className };

  return (
    <label htmlFor={name} className="flex flex-col gap-2">
      {label}
      {multiline ? (
        <textarea {...fieldProps} />
      ) : (
        <input type={type} {...fieldProps} />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
};

export default FormField;
