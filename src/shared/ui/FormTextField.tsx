import { useController, Control, FieldValues, Path } from 'react-hook-form';

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  autoFocus,
  autoComplete,
}: Props<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-medium">
        {label}
      </label>
      <input
        {...field}
        id={name}
        type={type}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
      />
      {fieldState.error && (
        <div className="invalid-feedback">{fieldState.error.message}</div>
      )}
    </div>
  );
}