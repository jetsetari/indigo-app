const i18n = {
  en: {
    home: {
      noAccount: 'Don’t have an account yet?',
      signup: 'Sign up here'
    },
    login: {
      title: 'Welcome Back',
      subline: 'Your goals are waiting.',
      emailLabel: 'Email',
      emailPlaceholder: 'john.doe@indigo.la',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Your password',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Min 6 characters',
      submitIdle: 'Login',
      submitSubmitting: 'Signing in…',
      forgotPassword: 'Forgot Password?',
      toastSuccessTitle: 'Welcome back 👋',
      toastSuccessBody: 'You’re now signed in.',
      toastFailTitle: 'Login failed',
      toastFailBodyFallback: 'We couldn’t sign you in. Please check your details and try again.',
    },
    register: {
      screenTitle: 'Register',
      title: 'Tell us about yourself',
      subtitle: 'Let’s kick things off',
      firstName: {
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: 'First name is required',
      },
      lastName: {
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: 'Last name is required',
      },
      dob: {
        label: 'Date of Birth',
        maxDate: 'Date cannot be in the future',
      },
      avatar: {
        label: 'Tap to add a profile picture'
      },
      login: {
        title: 'Login Details',
        subline: 'Secure your account with a strong email and password',
      },
      gender: {
        label: 'Select Gender',
        male: 'Male',
        female: 'Female',
        other: 'Non-binary',
        required: 'Please select male, female, or non-binary',
      },
      email: {
        label: 'Email',
        placeholder: 'john.doe@indigo.la',
        required: 'Email is required',
        invalid: 'Please enter a valid email',
      },
      password: {
        label: 'Password',
        placeholder: 'Your password',
        required: 'Password is required',
        tooShort: 'Min 6 characters',
      },
      terms: {
        label: 'I agree with Terms and Privacy Policy',
        required: 'You need to agree with the Terms and Privacy',
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
        subtitle: "Let's see where you're at\nso we know where to go",
      },
      system: { 
        label: 'Units', 
        metric: 'Metric',
        imperial: 'Imperial',
        required: 'Please choose a unit system',
      },
      weight: { 
        label: "What’s your current weight?", 
        unitKg: 'kg', 
        unitLbs: 'lbs' 
      },
      weightGoal: { 
        label: "What’s your goal weight?",
        required: 'Goal weight is required',
        numeric: 'Please enter a valid number',
      },
      height: { 
        label: 'How tall are you?',
        required: 'Height is required',
      },
      fat: { 
        label: 'Your fat percentage',
        invalid: 'Please enter a value between 0 and 100',
      },
      measuredBy: { 
        label: 'Measured by', 
        manual: 'Manual', 
        ai: 'AI' 
      },
      photos: { 
        front: 'Front', 
        side: 'Side', 
        back: 'Back',
        label: 'Progress photos',
        missingTitle: 'Photos required',
        missingBody: 'Please add front, side, and back photos.',
      },
      ctaCalc: 'AI Estimation',
      ctaNext: 'Next',
      toastSavedTitle: 'Saved',
      toastSavedBody: 'Your measurements are saved.',
      toastInvalidTitle: 'Missing information',
      toastInvalidBody: 'Please review the highlighted fields.',
      errors: { 
        saveFailed: 'Could not save your measurements' 
      },
      ai: {
        title: 'AI Estimation',
        body: 'We’re estimating your body fat from the photos.',
      },
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
      ctaSaving: 'Saving…',
      savedTitle: 'Saved',
      savedBody: 'Your goals have been saved.',
      saveFailedTitle: 'Save failed',
      saveFailedBody: 'Please try again.',
      loadErrorTitle: 'Error',
      loadErrorBody: 'Failed to load options.',

      // optional (only if you enforce at least one selection)
      errors: {
        weightRequired: 'Select at least one weight goal.',
        performanceRequired: 'Select at least one performance goal.',
        sportRequired: 'Select at least one sport goal.',
      },
    },
    level: {
      screenTitle: 'Fitness Level',
      title: 'How would you rate',
      subtitle: 'your current fitness level?',
      trainingDays: { label: 'How many days do you train?' },
      experience: { label: 'Training and Goals' },
      notes: {
        label: 'Got more to share?',
        placeholder: 'Fill in any details that could be relevant',
      },
      trainingHistory: { label: 'What describes your training history?', required: 'Please choose one option' },
      trainingHours: { label: 'How many hours are you willing to train per day?', required: 'Please choose hours' },
      ctaNext: 'Next',
      savedTitle: 'Saved',
      savedBody: 'Your level has been saved.',
      saveFailedTitle: 'Save failed',
      saveFailedBody: 'Please try again.',
      loadErrorTitle: 'Error',
      loadErrorBody: 'Failed to load options.',
    },
    workouts: {
      choose: 'Choose Workout',
      register: 'Register workout',
      subtitle: 'Cutting Plan',
      description:
        'Burn fat while keeping your hard-earned muscle. This plan combines strength training and high-intensity workouts.',
    }
  }
}



export default i18n;