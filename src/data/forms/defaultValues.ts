export const loginDefault = { 
  email: '', 
  password: '' 
};

export const registerDefault = {
  avatar_url: '',
  firstName: '',
  lastName: '',
  dob: null as Date | null,
  gender: '',
  email: '',
  password: '',
  agreed: false,
};

export const metricsDefault = {
  metricSystem: 'imperial' as 'metric' | 'imperial',
  weight: 120,
  desiredWeight: '',     // string input, we’ll coerce to number on save
  height: null,
  pictureFront: null as string | null,
  pictureSide:  null as string | null,
  pictureBack:  null as string | null,
  bodyfat: '',           // string or number; we coerce on save
};