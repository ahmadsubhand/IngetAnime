"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Control, Controller, FieldValues, Path, UseFormClearErrors } from "react-hook-form";
import { Field, FieldDescription } from "./ui/field";

export default function AnimeSearch<T extends FieldValues>({
  form,
  inputName,
  isDisable = false,
  className = "",
}: {
  form: {
    control: Control<T>;
    clearErrors: UseFormClearErrors<T>;
  };
  inputName: Path<T>;
  isDisable?: boolean;
  className?: string;
}) {
  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={`relative ${className}`}>
          <InputGroup>
            <InputGroupInput
              disabled={isDisable}
              placeholder="Cari anime ..."
              {...field}
              onChange={(e) => {
                field.onChange(e);
                form.clearErrors(inputName);
              }}
              aria-invalid={fieldState.invalid}
            />
            <InputGroupAddon align={"inline-end"}>
              <InputGroupButton disabled={isDisable} type='submit'>
                <Search />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {fieldState.invalid && (
            <FieldDescription
              className={`z-50 absolute -bottom-7 left-0 ${fieldState.invalid ? "text-destructive" : ""}`}
            >
              {fieldState.error?.message}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );
}
