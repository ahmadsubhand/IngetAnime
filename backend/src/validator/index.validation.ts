import z from 'zod';

export class IndexValidation {
  static readonly OPTIONAL_DATE = z.iso
    .date('Invalid date format. Use YYYY-MM-DD')
    .or(z.literal(''))
    .transform((value) => (value === '' ? null : value))
    .nullable();

  static readonly OPTIONAL_DATE_TIME = z.iso
    .datetime('Invalid ISO date format. Use YYYY-MM-DDTHH:mm:ss.sssZ')
    .or(z.literal(''))
    .transform((value) => (value === '' ? null : value))
    .nullable();

  static readonly FIELDS = z
    .string()
    .regex(
      /^$|^[^,\s]+(,[^,\s]+)*$/,
      'Invalid format. Value must be seperated by comma without any space',
    );

  static readonly USERNAME = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(
      /^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/,
      'Username can only contain letters, numbers, and underscores, but cannot start or end with an underscore',
    );

  static readonly BOOLEAN_QUERY = z
    .enum(['true', 'false'], 'Value must be one of true or false')
    .transform((val) => val === 'true');
}
