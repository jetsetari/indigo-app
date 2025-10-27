import useTranslation from '~/data/helpers/translation';
import type { Rule, DateRule, SelectRule, BoolRule } from '~/components/Form/validation';
const t = useTranslation();

export const validateLogin = {
  email: [
    { type: 'required', message: t.login.emailRequired },
    { type: 'email', message: t.login.emailInvalid },
  ] satisfies Rule[],

  password: [
    { type: 'required', message: t.login.passwordRequired },
    { type: 'minLength', value: 6, message: t.login.passwordTooShort },
  ] satisfies Rule[],
} as const;

const today = new Date();
export const validateRegister = {
  firstName: [{ type: 'required', message: t.register.firstName.required }] as Rule[],
  lastName:  [{ type: 'required', message: t.register.lastName.required  }] as Rule[],
  email: [
    { type: 'required', message: t.register.email.required },
    { type: 'email',    message: t.register.email.invalid  },
  ] as Rule[],
  password: [
    { type: 'required',  message: t.register.password.required },
    { type: 'minLength', value: 6, message: t.register.password.tooShort },
  ] as Rule[],
  dob: [
    { type: 'maxDate', value: new Date(), message: t.register?.dob?.maxDate || 'Date cannot be in the future' },
  ] as DateRule[],
  gender: [
    { type: 'required', message: t.register.gender.required },
    { type: 'in', values: ['male', 'female', 'other'], message: t.register.gender.required },
  ] as SelectRule[],
  agreed: [
    { type: 'mustBeTrue', message: t.register.terms.required },
  ] as BoolRule[],
} as const;

export const validateMetrics = {
  metricSystem: [
    { type: 'required', message: t.metrics.system.required },
    { type: 'in', values: ['metric', 'imperial'], message: t.metrics.system.required },
  ] as SelectRule[],

  desiredWeight: [
    { type: 'required', message: t.metrics.weightGoal.required },
    { type: 'regex', value: /^\d+(\.\d+)?$/, message: t.metrics.weightGoal.numeric },
  ] as Rule[],

  height: [
    { type: 'required', message: t.metrics.height.required },
  ] as SelectRule[],

  bodyfat: [
    { type: 'regex', value: /^(?:\d{1,2}(?:\.\d+)?|100(?:\.0+)?)$/, message: t.metrics.fat.invalid },
  ] as Rule[],
} as const;