"use client"

import { ReactNode, useId, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import dayjs from "dayjs";

interface DateFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputId?: string;
  inputLabel?: ReactNode;
  inputDescription?: string;
  inputPlaceholder?: string;
  className?: string;
  isRequired?: boolean;
}

export default function DateField<T extends FieldValues>({
  form,
  inputName,
  inputId,
  inputLabel,
  inputDescription,
  inputPlaceholder,
  className = "",
  isRequired = false,
}: DateFieldProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => {
        const selectedDate =
          typeof field.value === "string" && field.value
            ? dayjs(field.value, "YYYY-MM-DD", true).toDate()
            : undefined;

        return (
          <Field
            data-invalid={fieldState.invalid}
            className={className}
          >
            <FieldLabel htmlFor={inputId ?? id}>
              {inputLabel}{" "}
              <span className="text-red-500">
                {isRequired ? "*" : ""}
              </span>
            </FieldLabel>

            <InputGroup>
              <InputGroupInput
                value={field.value ?? ""}
                id={inputId ?? id}
                placeholder={inputPlaceholder}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value || null);
                  const parsedDate = dayjs(value, "YYYY-MM-DD", true);
                  if (parsedDate.isValid()) {
                    setMonth(parsedDate.toDate());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              />

              <InputGroupAddon align="inline-end">
                <Popover open={open} onOpenChange={(open) => {
                  setOpen(open);
                  if (!open && field.value) {
                    const selectedDate = dayjs(field.value, "YYYY-MM-DD", true);
                    if (selectedDate.isValid()) {
                      setMonth(selectedDate.toDate());
                    }
                  }
                }}>
                  <PopoverTrigger
                    render={
                      <InputGroupButton
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Select date"
                      >
                        <CalendarIcon />
                        <span className="sr-only">
                          Pilih tanggal
                        </span>
                      </InputGroupButton>
                    }
                  />

                  <PopoverContent
                    className="w-auto p-0"
                    align="end"
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      month={month ?? selectedDate}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        if (!date) {
                          field.onChange(null);
                          return;
                        }
                        field.onChange(dayjs(date).format("YYYY-MM-DD"));
                        setMonth(date);
                        setOpen(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            </InputGroup>

            {(fieldState.invalid || inputDescription) && (
              <FieldDescription className={fieldState.invalid ? "text-destructive" : ""}>
                {fieldState.error?.message || inputDescription}
              </FieldDescription>
            )}
          </Field>
        );
      }}
    />
  );
}