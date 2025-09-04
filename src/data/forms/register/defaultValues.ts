import type { RegistrationForm } from './validation';

const defaultValues: RegistrationForm = {
  firstName: '',
  lastName: '',
  dob: undefined as unknown as Date,
  email: '',
  password: '',
  agreed: false,
  gender: 'male',
  avatar_url: null,
};

export default defaultValues;
