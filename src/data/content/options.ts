import useTranslation from '~/data/helpers/translation';
const t = useTranslation().register;


export const genderOptions = [
  { label: t.gender.male,   value: 'male' },
  { label: t.gender.female, value: 'female' },
  { label: t.gender.other,  value: 'other' },
];



export const languagesData = [
  { label: 'English', value: 'en' },
  { label: 'Dutch', value: 'nl' },
  { label: 'French', value: 'fr' },
];


export const eatingOptions = [
  { label: 'Balanced Diet', description: 'Omnivore', icon: '🍽️', value: 'balanced' },
  { label: 'Vegetarian', description: 'No meat, but eats animal products', icon: '🥚', value: 'vegetarian' },
  { label: 'Keto', description: 'High fat, low carb', icon: '🌿', value: 'keto' },
  { label: 'Plant Based', description: 'No animal products consumed', icon: '🌾', value: 'plant-based' },
  { label: 'Pescatarian', description: 'Only fish and some animal products', icon: '🐟', value: 'pescatarian' },
  { label: 'Paleo Diet', description: 'High protein & fat, Low gluten & processed foods', icon: '🔥', value: 'paleo' },
];

export const mealOptions = [
  { label: '1 Meal', value: '1' },
  { label: '2 Meals', value: '2' },
  { label: '3 Meals', value: '3' },
  { label: '4 Meals', value: '4' },
  { label: '5+ Meals', value: '5' },
];

export const sportTrainingOptions = [
  { label: "Bodybuilding Contest", slug: "bodybuilding-contest" },
  { label: "Marathon Training", slug: "marathon-training" },
  { label: "Muay Thai Fight", slug: "muay-thai-fight" },
  { label: "Triathlon Prep", slug: "triathlon-prep" },
  { label: "Boxing Match", slug: "boxing-match" },
  { label: "Powerlifting Meet", slug: "powerlifting-meet" },
  { label: "CrossFit Competition", slug: "crossfit-competition" },
  { label: "Soccer Season Prep", slug: "soccer-prep" },
  { label: "Basketball Training Camp", slug: "basketball-camp" },
  { label: "MMA Fight Camp", slug: "mma-fight-camp" },
  { label: "Swimming Competition", slug: "swimming-competition" },
  { label: "Cycling Race", slug: "cycling-race" },
  { label: "Track & Field Event", slug: "track-field" },
  { label: "Jiu-Jitsu Tournament", slug: "jiu-jitsu-tournament" },
  { label: "Ski/Snowboard Season Prep", slug: "ski-snowboard-prep" },
];

export const performanceOptions= [
  { label: "Increase Endurance", slug: "endurance" },
  { label: "Build Muscle", slug: "build-muscle" },
  { label: "Build Strength", slug: "build-strength" },
  { label: "Build Power", slug: "build-power" },
]

export const weightOptions = [
  { label: "Lose Weight", slug: "lose-weight" },
  { label: "Maintain", slug: "maintain" },
  { label: "Gain Weight", slug: "gain-weight" },
  { label: "Gain Muscle", slug: "gain-muscle" },
]

export const experienceOptions = [
  { label: "HIIT Class", slug: "hiit-class" },
  { label: "Pilates Class", slug: "pilates-class" },
  { label: "Yoga Class", slug: "yoga-class" },
  { label: "Worked With A Personal Trainer", slug: "personal-trainer" },
  { label: "Gain Muscle", slug: "gain-muscle" },
  { label: "Followed An Intensive Workout program", slug: "intensive-program" },
  { label: "Participated in a recreational/cardio endurance race", slug: "cardio-endurance-race" },
];

export const trainingHistoryOptions = [
  { label: "Never followed a program / New to gym", value: "new" },
  { label: "Trained casually without structure", value: "casual" },
  { label: "Followed a structured training program", value: "structured" },
  { label: "Worked with a personal trainer before", value: "trainer" },
  { label: "Completed competitive prep (e.g. contest, race)", value: "competitive" },
];

export const trainingHoursOptions = [
  { label: "30 minutes", value: '0.5' },
  { label: "45 minutes", value: '0.5' },
  { label: "1 hour", value: '1' },
  { label: "1.5 hours", value: '1.5' },
  { label: "2 hours", value: '2' }
];

export const supplementOptions = [
  { label: "5-HTP", slug: "5-htp" },
  { label: "Alpha-GPC", slug: "alpha-gpc" },
  { label: "Amino Acids (EAA)", slug: "amino-acids-eaa" },
  { label: "Ashwagandha", slug: "ashwagandha" },
  { label: "B-Complex Vitamins", slug: "b-complex-vitamins" },
  { label: "BCAAs (Branched-Chain AAs)", slug: "bcaas" },
  { label: "Beta-Alanine", slug: "beta-alanine" },
  { label: "Biotin", slug: "biotin" },
  { label: "Calcium", slug: "calcium" },
  { label: "Casein Protein", slug: "casein-protein" },
  { label: "Choline", slug: "choline" },
  { label: "Chromium", slug: "chromium" },
  { label: "Citrulline Malate", slug: "citrulline-malate" },
  { label: "CLA (Conjugated Linoleic Acid)", slug: "cla" },
  { label: "CoQ10 (Coenzyme Q10)", slug: "coq10" },
  { label: "Collagen", slug: "collagen" },
  { label: "Creatine Monohydrate", slug: "creatine-monohydrate" },
  { label: "DHEA", slug: "dhea" },
  { label: "Electrolytes", slug: "electrolytes" },
  { label: "Fish Oil (Omega-3)", slug: "fish-oil" },
  { label: "Folate (Folic Acid)", slug: "folate" },
  { label: "GABA", slug: "gaba" },
  { label: "Ginkgo Biloba", slug: "ginkgo-biloba" },
  { label: "Glucosamine", slug: "glucosamine" },
  { label: "Glutamine", slug: "glutamine" },
  { label: "Green Tea Extract", slug: "green-tea-extract" },
  { label: "HMB", slug: "hmb" },
  { label: "Iron", slug: "iron" },
  { label: "KSM-66 (Ashwagandha extract)", slug: "ksm-66" },
  { label: "L-Arginine", slug: "l-arginine" },
  { label: "L-Carnitine", slug: "l-carnitine" },
  { label: "L-Theanine", slug: "l-theanine" },
  { label: "L-Tyrosine", slug: "l-tyrosine" },
  { label: "Lion’s Mane Mushroom", slug: "lions-mane" },
  { label: "Magnesium", slug: "magnesium" },
  { label: "Matcha Powder", slug: "matcha-powder" },
  { label: "Melatonin", slug: "melatonin" },
  { label: "Moringa", slug: "moringa" },
  { label: "Multivitamins", slug: "multivitamins" },
  { label: "NAC (N-Acetyl Cysteine)", slug: "nac" },
  { label: "Niacin (Vitamin B3)", slug: "niacin" },
  { label: "Plant-Based Protein Powder", slug: "plant-protein" },
  { label: "Pre-Workout Blend", slug: "pre-workout" },
  { label: "Probiotics", slug: "probiotics" },
  { label: "Psyllium Husk", slug: "psyllium-husk" },
  { label: "Rhodiola Rosea", slug: "rhodiola-rosea" },
  { label: "Selenium", slug: "selenium" },
  { label: "Spirulina", slug: "spirulina" },
  { label: "Testosterone Booster (natural)", slug: "testosterone-booster" },
  { label: "Tongkat Ali", slug: "tongkat-ali" },
  { label: "Turmeric (Curcumin)", slug: "turmeric" },
  { label: "Valerian Root", slug: "valerian-root" },
  { label: "Vegan Omega-3 (Algae)", slug: "vegan-omega-3" },
  { label: "Vitamin A", slug: "vitamin-a" },
  { label: "Vitamin C", slug: "vitamin-c" },
  { label: "Vitamin D3", slug: "vitamin-d3" },
  { label: "Vitamin E", slug: "vitamin-e" },
  { label: "Whey Protein", slug: "whey-protein" },
  { label: "Zinc", slug: "zinc" },
];

export const workouts = [
  { label: 'Pull–Ups', value: 'pull-ups', slug: 'pull-ups', screen: 'Workouts', image: require('~/assets/images/dummy/workout-1.jpg') },
  { label: 'Barbell Bench Press', value: 'barbell-bench', slug: 'barbell-bench-press', screen: 'Workouts', image: require('~/assets/images/dummy/workout-2.jpg') },
  { label: 'One–Arm Dumbbell Row', value: 'one-arm', slug: 'one-arm-dumbbell-row', screen: 'Workouts', image: require('~/assets/images/dummy/workout-3.jpg') },
  { label: 'Seated Shoulder Press (Dumbbell)', value: 'seated-shoulder', slug: 'seated-shoulder-press-dumbbell', screen: 'Workouts', image: require('~/assets/images/dummy/workout-1.jpg') },
  { label: 'EZ Bar Bicep Curls', value: 'ez-bar', slug: 'ez-bar-bicep-curls', screen: 'Workouts', image: require('~/assets/images/dummy/workout-3.jpg') },
  { label: 'Triceps Rope Pushdowns', value: 'triceps-rope', slug: 'triceps-rope-pushdowns', screen: 'Workouts', image: require('~/assets/images/dummy/workout-2.jpg') },
  { label: 'Face Pulls', value: 'face-pulls', slug: 'face-pulls', screen: 'Workouts', image: require('~/assets/images/dummy/workout-1.jpg') },
];


export const workoutsList = [
  { value: 'upper-body-strength', label: 'Upper Body Strength' },
  { value: 'lower-body-strength', label: 'Lower Body Strength' },
  { value: 'push-core-circuit',   label: 'Push & Core Circuit' },
  { value: 'hiit-full-body-burn',  label: 'HIIT + Full Body Burn' },
];


export const plansExamples = [
  {
    id: 'cutting',
    title: 'Cutting Plan',
    subtitle: 'Fat Loss + Muscle Retention',
    image: require('~/assets/images/dummy/example-1.png'),
    days: [
      { day: 'Day 1', label: 'Upper Body Strength', completed: false },
      { day: 'Day 2', label: 'Lower Body Strength', completed: true },
      { day: 'Day 3', label: 'Push & Core Circuit', completed: true },
      { day: 'Day 4', label: 'HIIT + Full Body Burn', completed: false },
    ]
  },
  {
    id: 'bulking',
    title: 'Bulking Plan',
    subtitle: 'Muscle Gain Focus',
    image: require('~/assets/images/dummy/example-2.png'),
    days: [
      { day: 'Day 1', label: 'Upper Body Strength', completed: false },
      { day: 'Day 2', label: 'Lower Body Strength', completed: true },
      { day: 'Day 3', label: 'Push & Core Circuit', completed: true },
      { day: 'Day 4', label: 'HIIT + Full Body Burn', completed: false },
    ]
  }
];


export const workoutExercises = [
  {
    title: 'Pull-Ups',
    subtitle: '3 Sets of 6–10',
    image: require('~/assets/images/dummy/example-3.png'),
  },
  {
    title: 'Barbell Bench Press',
    subtitle: '4 Sets of 6–8',
    image: require('~/assets/images/dummy/example-4.png'),
  },
  {
    title: 'One-Arm Dumbbell Row',
    subtitle: '3 Sets of 10–12',
    image: require('~/assets/images/dummy/example-5.png'),
  },
  {
    title: 'Seated Shoulder Press (Dumbbell)',
    subtitle: '3 Sets of 10',
    image: require('~/assets/images/dummy/example-6.png'),
  },
  {
    title: 'EZ Bar Bicep Curls',
    subtitle: '3 Sets of 12',
    image: require('~/assets/images/dummy/example-7.png'),
  },
  {
    title: 'Triceps Rope Pushdowns',
    subtitle: '3 Sets of 12',
    image: require('~/assets/images/dummy/example-8.png'),
  },
  {
    title: 'Face Pulls',
    subtitle: '2 Sets of 15',
    image: require('~/assets/images/dummy/example-9.png'),
  },
];
