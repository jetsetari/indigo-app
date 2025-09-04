import { Control, FieldValues } from 'react-hook-form';
export type ControlOf<T extends FieldValues> = Control<T, any, T>;