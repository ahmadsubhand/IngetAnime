import { ReactNode, useId } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import { Input } from './ui/input';

interface InputFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputId?: string;
  inputLabel?: ReactNode;
  inputDescription?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'number';
  className?: string;
  isRequired?: boolean;
  isDisable?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export default function InputField<T extends FieldValues>({
  form,
  inputName,
  inputId,
  inputLabel,
  inputDescription,
  inputPlaceholder,
  inputType = 'text',
  className = '',
  isRequired = false,
  isDisable = false,
  orientation = 'vertical',
}: InputFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={`${className}`}
          orientation={orientation}
        >
          {inputLabel && (
            <FieldLabel htmlFor={inputId ?? id}>
              {inputLabel}{' '}
              <span className="text-red-500">{isRequired ? '*' : ''}</span>
            </FieldLabel>
          )}
          <Input
            className='bg-background'
            disabled={isDisable}
            {...field}
            id={inputId ?? id}
            type={inputType}
            placeholder={inputPlaceholder}
            aria-invalid={fieldState.invalid}
            {...(inputType === 'number' && {
              onChange: (e) => field.onChange(parseInt(e.target.value)),
            })}
          />
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
