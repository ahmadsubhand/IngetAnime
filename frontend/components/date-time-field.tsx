'use client';

import { ReactNode, useId, useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import dayjs from 'dayjs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface DateTimeFieldProps<T extends FieldValues> {
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
  isDisable?: boolean;
}

export default function DateTimeField<T extends FieldValues>({
  form,
  inputName,
  inputId,
  inputLabel,
  inputDescription,
  inputPlaceholder,
  className = '',
  isRequired = false,
  isDisable = false,
}: DateTimeFieldProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  return (
    <Controller
      name={inputName}
      control={form.control}
      render={({ field, fieldState }) => {
        const selectedDate =
          typeof field.value === 'string' && field.value
            ? dayjs(field.value, 'YYYY-MM-DDTHH:mm', true)
            : undefined;

        function handleDateSelect(date: Date | undefined) {
          if (!date) {
            field.onChange(null);
            return;
          }

          const currentHour = selectedDate ? selectedDate.hour() : 0;
          const currentMinute = selectedDate ? selectedDate.minute() : 0;
          const newDate = dayjs(date)
            .set('hour', currentHour)
            .set('minute', currentMinute);
          field.onChange(newDate.format('YYYY-MM-DDTHH:mm'));
          setMonth(date);
        }

        function handleTimeChange(type: 'hour' | 'minute', value: string) {
          const currentDate = selectedDate || dayjs();
          let newDate = dayjs(currentDate);

          if (type === 'hour') {
            newDate = newDate.set('hour', parseInt(value, 10));
          } else if (type === 'minute') {
            newDate = newDate.set('minute', parseInt(value, 10));
          }

          field.onChange(newDate.format('YYYY-MM-DDTHH:mm'));
        }

        return (
          <Field
            data-invalid={fieldState.invalid}
            className={`flex flex-col ${className}`}
          >
            <FieldLabel htmlFor={inputId ?? id}>
              {inputLabel}{' '}
              <span className="text-red-500">{isRequired ? '*' : ''}</span>
            </FieldLabel>

            <InputGroup
              className={`${
                fieldState.invalid
                  ? ''
                  : fieldState.isDirty
                    ? 'border-primary has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-primary/50'
                    : ''
              }`}
            >
              {/* Belum */}
              <InputGroupInput
                disabled={isDisable}
                value={field.value ?? ''}
                id={inputId ?? id}
                placeholder={inputPlaceholder}
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value || null);
                  const parsedDate = dayjs(value, 'YYYY-MM-DDTHH:mm', true);
                  if (parsedDate.isValid()) {
                    setMonth(parsedDate.toDate());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              />

              <InputGroupAddon align="inline-end">
                <Popover
                  // belum
                  open={open}
                  onOpenChange={(open) => {
                    setOpen(open);
                    if (!open && field.value) {
                      const selectedDate = dayjs(
                        field.value,
                        'YYYY-MM-DDTHH:mm',
                        true,
                      );
                      if (selectedDate.isValid()) {
                        setMonth(selectedDate.toDate());
                      }
                    }
                  }}
                >
                  <PopoverTrigger
                    render={
                      <InputGroupButton
                        disabled={isDisable}
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Select date"
                      >
                        <CalendarIcon />
                        <span className="sr-only">Pilih waktu & tanggal</span>
                      </InputGroupButton>
                    }
                  />

                  <PopoverContent
                    className="w-auto p-0"
                    align="end"
                    sideOffset={10}
                  >
                    <div className="sm:flex">
                      <Calendar
                        mode="single"
                        month={month ?? selectedDate?.toDate()}
                        onMonthChange={setMonth}
                        selected={selectedDate?.toDate()}
                        onSelect={handleDateSelect}
                        captionLayout="dropdown"
                      />
                      <div className="flex flex-col sm:flex-row sm:h-75 divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 24 }, (_, i) => i)
                              // .reverse()
                              .map((hour) => (
                                <Button
                                  key={hour}
                                  size="icon"
                                  variant={
                                    selectedDate && selectedDate.hour() === hour
                                      ? 'default'
                                      : 'ghost'
                                  }
                                  className="sm:w-full shrink-0 aspect-square"
                                  onClick={() =>
                                    handleTimeChange('hour', hour.toString())
                                  }
                                >
                                  {hour}
                                </Button>
                              ))}
                          </div>
                          <ScrollBar
                            orientation="horizontal"
                            className="sm:hidden"
                          />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                              (minute) => (
                                <Button
                                  key={minute}
                                  size="icon"
                                  variant={
                                    selectedDate &&
                                    selectedDate.minute() === minute
                                      ? 'default'
                                      : 'ghost'
                                  }
                                  className="sm:w-full shrink-0 aspect-square"
                                  onClick={() =>
                                    handleTimeChange(
                                      'minute',
                                      minute.toString(),
                                    )
                                  }
                                >
                                  {minute.toString().padStart(2, '0')}
                                </Button>
                              ),
                            )}
                          </div>
                          <ScrollBar
                            orientation="horizontal"
                            className="sm:hidden"
                          />
                        </ScrollArea>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            </InputGroup>

            {(fieldState.invalid || inputDescription) && (
              <FieldDescription
                className={fieldState.invalid ? 'text-destructive' : ''}
              >
                {fieldState.error?.message || inputDescription}
              </FieldDescription>
            )}
          </Field>
        );
      }}
    />
  );
}
