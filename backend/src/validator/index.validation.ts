import z from 'zod';

export class IndexValidation {
  static readonly OPTIONAL_DATE = z
    .string('Invalid date format. Use YYYY-MM-DD')
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date')
    .transform((value) => (value === '' ? null : value))
    .nullable();

  static readonly OPTIONAL_DATE_TIME = z
    .string('Invalid ISO date format. Use YYYY-MM-DDTHH:mm:ss.sssZ')
    .regex(
      /^$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      'Invalid ISO date format. Use YYYY-MM-DDTHH:mm:ss.sssZ',
    )
    .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date')
    .transform((value) => (value === '' ? null : value))
    .nullable();
}
