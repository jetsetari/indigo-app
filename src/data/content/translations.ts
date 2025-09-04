const i18n = {
  en: {
    home: {
      noAccount: 'Don’t have an account yet?',
      signup: 'Sign up here'
    },
    register: {
      screenTitle: 'Register',
      title: 'Tell us about yourself',
      subtitle: 'Let’s kick things off',
      firstName: {
        label: 'First Name',
        placeholder: 'Your legendary first name here',
      },
      lastName: {
        label: 'Last Name',
        placeholder: 'The last name your gym buddies yell',
      },
      dob: {
        label: 'Date of Birth',
      },
      login: {
        title: 'Login Details',
        subline: 'Secure your account with a strong email and password',
      },
      gender: {
        label: 'Select Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other'
      },
      email: {
        label: 'Email',
        placeholder: 'john.doe@indigo.la',
      },
      password: {
        label: 'Password',
        placeholder: 'Your password',
      },
      terms: {
        label: 'I agree with Terms and Privacy Policy',
      },
      cta: 'Create Account',
      errors: {
        registerFailed: 'Registration failed'
      }
    },
    metrics: {
      screenTitle: 'Measurements',
      header: {
        title: 'Hi {{name}},',
        subtitle: "Let's see where you're at,\nso we know where to go",
      },
      system: { label: 'Units', kgcm: 'kg/cm', lbsin: 'lbs/inches' },
      weight: { label: "What’s your current weight?", unitKg: 'kg', unitLbs: 'lbs' },
      weightGoal: { label: "What’s your goal weight?" },
      height: { label: 'How tall are you?' },
      fat: { label: 'Your fat percentage' },
      measuredBy: { label: 'Measured by', manual: 'Manual', ai: 'AI' },
      photos: { front: 'Front', side: 'Side', back: 'Back' },
      ctaCalc: 'AI Estimation',
      ctaNext: 'Next',
      errors: { saveFailed: 'Could not save your measurements' },
    },
    goals: {
      screenTitle: 'Goals',
      header: {
        title: 'Let’s define your goals, {{name}}',
        subtitle: 'Choose what applies.',
      },
      sections: {
        weight: 'Weight Goals',
        performance: 'Performance',
        sport: 'Sport specific training',
      },
      ctaNext: 'Next',
    },
  }
}

export default i18n;