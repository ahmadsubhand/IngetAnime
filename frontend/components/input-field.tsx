import { ReactNode } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from './ui/input';

interface InputFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputLabel?: ReactNode;
  inputPlaceholder?: string;
  inputType?: "text" | "number";
  className?: string;
  isRequired?: boolean;
}

export default function InputField<T extends FieldValues>({
  form,
  inputName,
  inputLabel,
  inputPlaceholder,
  inputType = "text",
  className = "",
  isRequired = false,
}: InputFieldProps<T>) {
  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={`${className}`}>
          <FieldLabel htmlFor="fdsfdsfsfd">
            {inputLabel}{" "}
            <span className="text-red-500">{isRequired ? "*" : ""}</span>
          </FieldLabel>
          <Input 
            {...field}
            id="fdsfdsfsfd"
            type={inputType}
            placeholder={inputPlaceholder}
            aria-invalid={fieldState.invalid}
            {...(inputType === "number" && {
              onChange: (e) => field.onChange(parseInt(e.target.value)),
            })}
          />
          {fieldState.invalid && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}
