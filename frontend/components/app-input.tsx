import { Field, FieldDescription, FieldLabel } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';
import { useId } from 'react';

export default function AppInput(
  { size, id, label, placeholder, leftIcon, rightIcon, errorMessage, ...props }: 
  { 
    size: 'sm' | 'md';
    id?: string;
    label?: string;
    placeholder?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    errorMessage?: string;
  }
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field className={
      size === 'sm' ? 'gap-2' : 
      size === 'md' ? 'gap-3' : 
      'gap-3'
    }>
      {label && 
        <FieldLabel htmlFor={inputId} className={
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-base' : 
          'text-base'
        }>
          Input Field
        </FieldLabel>
      }

      <InputGroup {...props} className={
        size === 'sm' ? 'h-6' : 
        size === 'md' ? 'h-9' : 
        'h-9'
      }>
        {leftIcon &&
          <InputGroupAddon align={'inline-start'} className={
            size === 'sm' ? 'pl-2 pr-0.5' : 
            size === 'md' ? 'pl-3 pr-1.5' : 
            'pl-3 pr-1.5'
          }>
            {leftIcon}
          </InputGroupAddon>
        }
        
        <InputGroupInput id={inputId} {...placeholder && { placeholder }} className={
          size === 'sm' ? 'text-xs md:text-xs placeholder:text-xs h-6' : 
          size === 'md' ? 'text-base md:text-base placeholder:text-base h-9' : 
          'text-base md:text-base placeholder:text-base h-9'
        }/>

        {rightIcon &&
          <InputGroupAddon align={'inline-end'} className={
            size === 'sm' ? 'pr-2 pl-0.5' : 
            size === 'md' ? 'pr-3 pl-1.5' : 
            'pr-3 pl-1.5'
          }>
            {rightIcon}
          </InputGroupAddon>
        }
      </InputGroup>

      {errorMessage &&
        <FieldDescription className='text-destructive'>
          {errorMessage}
        </FieldDescription>
      }
    </Field>
  )
}