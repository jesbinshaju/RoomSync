export interface StudentCharacteristics {
  academicMajor: string;
  studyHoursPerDay: number;
  studyTimePreference: string;
  academicGoal: string;
  sleepTime: string;
  wakeTime: string;
  napFrequency: string;
  hobbies: string[];
  cleanlinessLevel: number;
  noiseTolerance: number;
  socialLevel: number;
  guestFrequency: string;
  smoking: boolean;
  drinking: boolean;
  dietType: string;
  foodInRoom: boolean;
  acPreference: string;
  lightSensitivity: string;
}

export interface CompatibilityBreakdown {
  academic: number;
  sleep: number;
  hobby: number;
  lifestyle: number;
  food: number;
  environment: number;
  total: number;
}

/**
 * TypeScript mirror of PostgreSQL calculate_compatibility function.
 * Used for real-time live preview on profile edit page.
 */
export function calculateCompatibility(
  a: StudentCharacteristics,
  b: StudentCharacteristics
): CompatibilityBreakdown {
  let academic = 0;
  let sleep = 0;
  let hobby = 0;
  let lifestyle = 0;
  let food = 0;
  let environment = 0;

  // ACADEMIC (25 pts)
  if (a.academicMajor === b.academicMajor) academic += 15;
  if (a.studyTimePreference === b.studyTimePreference) academic += 6;
  if (Math.abs(a.studyHoursPerDay - b.studyHoursPerDay) <= 2) academic += 4;

  // SLEEP (25 pts)
  if (a.sleepTime === b.sleepTime) sleep += 15;
  if (a.wakeTime === b.wakeTime) sleep += 7;
  if (a.napFrequency === b.napFrequency) sleep += 3;

  // HOBBIES (20 pts)
  const sharedHobbies = a.hobbies.filter((h) => b.hobbies.includes(h)).length;
  if (sharedHobbies >= 3) hobby = 20;
  else if (sharedHobbies === 2) hobby = 14;
  else if (sharedHobbies === 1) hobby = 7;

  // LIFESTYLE (20 pts)
  if (Math.abs(a.cleanlinessLevel - b.cleanlinessLevel) <= 1) lifestyle += 6;
  if (Math.abs(a.noiseTolerance - b.noiseTolerance) <= 1) lifestyle += 6;
  if (Math.abs(a.socialLevel - b.socialLevel) <= 1) lifestyle += 4;
  if (a.guestFrequency === b.guestFrequency) lifestyle += 2;
  if (a.smoking === b.smoking) lifestyle += 1;
  if (a.drinking === b.drinking) lifestyle += 1;

  // FOOD (5 pts)
  if (a.dietType === b.dietType) food += 3;
  if (a.foodInRoom === b.foodInRoom) food += 2;

  // ENVIRONMENT (5 pts)
  if (a.acPreference === b.acPreference) environment += 3;
  if (a.lightSensitivity === b.lightSensitivity) environment += 2;

  return {
    academic,
    sleep,
    hobby,
    lifestyle,
    food,
    environment,
    total: academic + sleep + hobby + lifestyle + food + environment,
  };
}

export const HOBBY_OPTIONS = [
  "sports",
  "music",
  "gaming",
  "reading",
  "art",
  "cooking",
  "travel",
  "photography",
  "coding",
  "fitness",
] as const;
