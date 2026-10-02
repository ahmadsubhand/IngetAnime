"use client"

import { ReactNode, useId } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Switch } from './ui/switch';

interface SwitchFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputId?: string;
  inputLabel?: ReactNode;
  inputDescription?: string;
  className?: string;
  isRequired?: boolean;
  isDisable?: boolean;
  labelPosition?: "left" | "right";
}

export default function SwitchField<T extends FieldValues>({
  form,
  inputName,
  inputId,
  inputLabel,
  inputDescription,
  className = "",
  isRequired = false,
  isDisable = false,
  labelPosition = "right",
}: SwitchFieldProps<T>) {
  const id = useId();

  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={className}
        >
          <div className={`flex gap-2 items-center ${labelPosition === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
            <FieldLabel 
              htmlFor={inputId ?? id} 
              className={`flex gap-2 items-center ${labelPosition === 'left' ? 'text-right flex-row' : 'text-left flex-row-reverse'}`}
            >
              <span className="text-red-500">
                {isRequired ? " * " : ""}
              </span>
              {inputLabel}
            </FieldLabel>
            <Switch 
              id={inputId ?? id}
              disabled={isDisable}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}  />
          </div>
          {(fieldState.invalid || inputDescription) && (
            <FieldDescription className={fieldState.invalid ? "text-destructive" : ""}>
              {fieldState.error?.message || inputDescription}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );
}