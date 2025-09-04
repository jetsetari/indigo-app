import { z } from 'zod';

const genders = ['male', 'female', 'other'] as const;

export const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  dob: z.any()
    .refine((v): v is Date => v instanceof Date && !isNaN(v.getTime()), { message: 'Date of birth is required' })
    .refine((d) => d <= new Date(), { message: 'Date cannot be in the future' }),
  gender: z.enum(genders),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreed: z.boolean().refine((v) => v === true, { message: 'Please accept the terms' }),
  avatar_url: z.string().url().nullable().optional(),
});

export type RegistrationForm =
  Omit<z.infer<typeof registrationSchema>, 'dob'> & { dob: Date };
