import { ReactNode, useId } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from './ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface OtpFieldProps<T extends FieldValues> {
  form: {
    control: Control<T>;
  };
  inputName: Path<T>;
  inputId?: string;
  inputLabel?: ReactNode;
  className?: string;
  isRequired?: boolean;
  isDisable?: boolean;
}

export default function OtpField<T extends FieldValues>({
  form,
  inputName,
  inputId,
  inputLabel,
  className = '',
  isRequired = false,
  isDisable = false,
}: OtpFieldProps<T>) {
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
          <InputOTP
            maxLength={6}
            disabled={isDisable}
            {...field}
            id={inputId ?? id}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot
                  aria-invalid={fieldState.invalid}
                  key={index}
                  index={index}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
