import { ReactNode } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { PasswordInput } from "./ui/password-input";

interface PasswordFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputLabel?: ReactNode;
  inputPlaceholder?: string;
  className?: string;
  isRequired?: boolean;
  isDisable?: boolean;
}

export default function PasswordField<T extends FieldValues>({
  form,
  inputName,
  inputLabel,
  inputPlaceholder,
  className = "",
  isRequired = false,
  isDisable = false,
}: PasswordFieldProps<T>) {
  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor="fdsfdsfsfd">
            {inputLabel}{" "}
            <span className="text-red-500">{isRequired ? "*" : ""}</span>
          </FieldLabel>
          <PasswordInput
            {...field}
            disabled={isDisable}
            id="fdsfdsfsfd"
            placeholder={inputPlaceholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
