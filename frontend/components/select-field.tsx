import { ReactNode, useId } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from './ui/select';

interface SelectFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  options: {
    label: string;
    value: string | number | null;
  }[];
  inputName: Path<T>;
  inputId?: string;
  inputLabel?: ReactNode;
  inputDescription?: string;
  className?: string;
  isRequired?: boolean;
  isDisable?: boolean;
}

export default function SelectField<T extends FieldValues>({
  form,
  options,
  inputName,
  inputId,
  inputLabel,
  inputDescription,
  className = '',
  isRequired = false,
  isDisable = false,
}: SelectFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={`${className}`}>
          <FieldLabel htmlFor={inputId ?? id}>
            {inputLabel}{' '}
            <span className="text-red-500">{isRequired ? '*' : ''}</span>
          </FieldLabel>
          <Select
            items={options}
            value={field.value}
            onValueChange={field.onChange}
            disabled={isDisable}
          >
            <SelectTrigger
              className={`bg-background w-full`}
              id={inputId ?? id}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{inputLabel}</SelectLabel>
                {options.map((option) => (
                  <SelectItem value={option.value} key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {(fieldState.invalid || inputDescription) && (
            <FieldDescription
              className={fieldState.invalid ? 'text-destructive' : ''}
            >
              {fieldState.error?.message || inputDescription}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );
}
