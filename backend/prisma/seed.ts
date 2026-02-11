import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Chest Exercises (7)
  {
    name: 'Barbell Bench Press',
    description: 'Classic compound chest exercise',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Barbell',
    instructions: 'Lie on bench, lower bar to chest, press up until arms are extended',
    isCustom: false,
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest exercise with greater range of motion',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Dumbbells',
    instructions: 'Lie on bench with dumbbells, press up until arms are extended',
    isCustom: false,
  },
  {
    name: 'Incline Bench Press',
    description: 'Targets upper chest',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Barbell',
    instructions: 'Perform bench press on inclined bench (30-45 degrees)',
    isCustom: false,
  },
  {
    name: 'Decline Bench Press',
    description: 'Targets lower chest',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps'],
    equipment: 'Barbell',
    instructions: 'Perform bench press on declined bench',
    isCustom: false,
  },
  {
    name: 'Chest Fly',
    description: 'Isolation exercise for chest',
    category: 'strength',
    muscleGroups: ['Chest'],
    equipment: 'Dumbbells',
    instructions: 'Lie on bench, lower dumbbells with slight bend in elbows, bring together over chest',
    isCustom: false,
  },
  {
    name: 'Push-ups',
    description: 'Classic bodyweight chest exercise',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders', 'Core'],
    equipment: 'Bodyweight',
    instructions: 'Lower body until chest nearly touches floor, push back up',
    isCustom: false,
  },
  {
    name: 'Dips',
    description: 'Compound exercise for chest and triceps',
    category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Dip Bars',
    instructions: 'Lower body by bending arms, push back up until arms are extended',
    isCustom: false,
  },

  // Back Exercises (7)
  {
    name: 'Barbell Row',
    description: 'Compound back exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Barbell',
    instructions: 'Bend at waist, pull barbell to torso, lower with control',
    isCustom: false,
  },
  {
    name: 'Dumbbell Row',
    description: 'Unilateral back exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Dumbbells',
    instructions: 'Support body with one arm, row dumbbell to hip with other arm',
    isCustom: false,
  },
  {
    name: 'Pull-ups',
    description: 'Bodyweight back exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Pull-up Bar',
    instructions: 'Hang from bar with overhand grip, pull up until chin clears bar',
    isCustom: false,
  },
  {
    name: 'Chin-ups',
    description: 'Underhand grip pull-up variation',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Pull-up Bar',
    instructions: 'Hang from bar with underhand grip, pull up until chin clears bar',
    isCustom: false,
  },
  {
    name: 'Lat Pulldown',
    description: 'Cable machine back exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Cable Machine',
    instructions: 'Pull bar down to upper chest, return with control',
    isCustom: false,
  },
  {
    name: 'Seated Cable Row',
    description: 'Horizontal pulling exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Biceps'],
    equipment: 'Cable Machine',
    instructions: 'Sit upright, pull handle to torso, return with control',
    isCustom: false,
  },
  {
    name: 'Deadlift',
    description: 'Full body compound exercise',
    category: 'strength',
    muscleGroups: ['Back', 'Legs', 'Core'],
    equipment: 'Barbell',
    instructions: 'Lift barbell from floor by extending hips and knees, lower with control',
    isCustom: false,
  },

  // Shoulder Exercises (6)
  {
    name: 'Overhead Press',
    description: 'Compound shoulder exercise',
    category: 'strength',
    muscleGroups: ['Shoulders', 'Triceps'],
    equipment: 'Barbell',
    instructions: 'Press barbell overhead from shoulders until arms are extended',
    isCustom: false,
  },
  {
    name: 'Arnold Press',
    description: 'Dumbbell shoulder press variation',
    category: 'strength',
    muscleGroups: ['Shoulders'],
    equipment: 'Dumbbells',
    instructions: 'Rotate dumbbells while pressing overhead',
    isCustom: false,
  },
  {
    name: 'Lateral Raise',
    description: 'Isolation exercise for side delts',
    category: 'strength',
    muscleGroups: ['Shoulders'],
    equipment: 'Dumbbells',
    instructions: 'Raise dumbbells to sides until parallel with floor',
    isCustom: false,
  },
  {
    name: 'Front Raise',
    description: 'Isolation exercise for front delts',
    category: 'strength',
    muscleGroups: ['Shoulders'],
    equipment: 'Dumbbells',
    instructions: 'Raise dumbbells in front until parallel with floor',
    isCustom: false,
  },
  {
    name: 'Rear Delt Fly',
    description: 'Isolation exercise for rear delts',
    category: 'strength',
    muscleGroups: ['Shoulders'],
    equipment: 'Dumbbells',
    instructions: 'Bend at waist, raise dumbbells to sides',
    isCustom: false,
  },
  {
    name: 'Face Pull',
    description: 'Cable exercise for rear delts and upper back',
    category: 'strength',
    muscleGroups: ['Shoulders', 'Back'],
    equipment: 'Cable Machine',
    instructions: 'Pull rope attachment toward face, separating rope at end',
    isCustom: false,
  },

  // Leg Exercises (8)
  {
    name: 'Barbell Squat',
    description: 'Compound leg exercise',
    category: 'strength',
    muscleGroups: ['Legs', 'Core'],
    equipment: 'Barbell',
    instructions: 'Lower body by bending knees and hips, return to standing',
    isCustom: false,
  },
  {
    name: 'Front Squat',
    description: 'Squat variation with bar in front',
    category: 'strength',
    muscleGroups: ['Legs', 'Core'],
    equipment: 'Barbell',
    instructions: 'Hold bar across front shoulders, perform squat',
    isCustom: false,
  },
  {
    name: 'Leg Press',
    description: 'Machine-based leg exercise',
    category: 'strength',
    muscleGroups: ['Legs'],
    equipment: 'Leg Press Machine',
    instructions: 'Push platform away by extending knees and hips',
    isCustom: false,
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hamstring-focused exercise',
    category: 'strength',
    muscleGroups: ['Legs', 'Back'],
    equipment: 'Barbell',
    instructions: 'Lower bar by pushing hips back, keep legs mostly straight',
    isCustom: false,
  },
  {
    name: 'Leg Curl',
    description: 'Isolation exercise for hamstrings',
    category: 'strength',
    muscleGroups: ['Legs'],
    equipment: 'Leg Curl Machine',
    instructions: 'Curl legs up toward glutes, lower with control',
    isCustom: false,
  },
  {
    name: 'Leg Extension',
    description: 'Isolation exercise for quadriceps',
    category: 'strength',
    muscleGroups: ['Legs'],
    equipment: 'Leg Extension Machine',
    instructions: 'Extend legs until straight, lower with control',
    isCustom: false,
  },
  {
    name: 'Calf Raise',
    description: 'Isolation exercise for calves',
    category: 'strength',
    muscleGroups: ['Legs'],
    equipment: 'Machine or Bodyweight',
    instructions: 'Raise up on toes, lower with control',
    isCustom: false,
  },
  {
    name: 'Lunges',
    description: 'Unilateral leg exercise',
    category: 'strength',
    muscleGroups: ['Legs'],
    equipment: 'Dumbbells or Bodyweight',
    instructions: 'Step forward and lower back knee toward ground, return to standing',
    isCustom: false,
  },

  // Bicep Exercises (5)
  {
    name: 'Barbell Curl',
    description: 'Classic bicep exercise',
    category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: 'Barbell',
    instructions: 'Curl barbell up, keeping elbows stationary',
    isCustom: false,
  },
  {
    name: 'Dumbbell Curl',
    description: 'Bicep exercise with dumbbells',
    category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: 'Dumbbells',
    instructions: 'Curl dumbbells up, keeping elbows stationary',
    isCustom: false,
  },
  {
    name: 'Hammer Curl',
    description: 'Neutral grip bicep curl',
    category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: 'Dumbbells',
    instructions: 'Curl dumbbells with palms facing each other',
    isCustom: false,
  },
  {
    name: 'Preacher Curl',
    description: 'Bicep curl on preacher bench',
    category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: 'EZ Bar',
    instructions: 'Rest upper arms on pad, curl bar up',
    isCustom: false,
  },
  {
    name: 'Cable Curl',
    description: 'Bicep curl using cable machine',
    category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: 'Cable Machine',
    instructions: 'Curl cable attachment up, keeping elbows stationary',
    isCustom: false,
  },

  // Tricep Exercises (5)
  {
    name: 'Close-Grip Bench Press',
    description: 'Compound tricep exercise',
    category: 'strength',
    muscleGroups: ['Triceps', 'Chest'],
    equipment: 'Barbell',
    instructions: 'Bench press with hands closer than shoulder width',
    isCustom: false,
  },
  {
    name: 'Tricep Dips',
    description: 'Bodyweight tricep exercise',
    category: 'strength',
    muscleGroups: ['Triceps', 'Chest'],
    equipment: 'Dip Bars',
    instructions: 'Lower body with elbows close to body, push back up',
    isCustom: false,
  },
  {
    name: 'Overhead Tricep Extension',
    description: 'Isolation exercise for triceps',
    category: 'strength',
    muscleGroups: ['Triceps'],
    equipment: 'Dumbbell',
    instructions: 'Hold weight overhead, lower behind head, extend arms',
    isCustom: false,
  },
  {
    name: 'Tricep Pushdown',
    description: 'Cable tricep exercise',
    category: 'strength',
    muscleGroups: ['Triceps'],
    equipment: 'Cable Machine',
    instructions: 'Push cable attachment down by extending elbows',
    isCustom: false,
  },
  {
    name: 'Skull Crusher',
    description: 'Lying tricep extension',
    category: 'strength',
    muscleGroups: ['Triceps'],
    equipment: 'EZ Bar',
    instructions: 'Lie on bench, lower bar toward forehead, extend arms',
    isCustom: false,
  },

  // Core Exercises (6)
  {
    name: 'Plank',
    description: 'Isometric core exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Bodyweight',
    instructions: 'Hold push-up position on forearms, keep body straight',
    isCustom: false,
  },
  {
    name: 'Side Plank',
    description: 'Lateral core stability exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Bodyweight',
    instructions: 'Hold side position on one forearm, keep body straight',
    isCustom: false,
  },
  {
    name: 'Crunches',
    description: 'Basic ab exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Bodyweight',
    instructions: 'Lift shoulders off ground by contracting abs',
    isCustom: false,
  },
  {
    name: 'Leg Raises',
    description: 'Lower ab exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Bodyweight',
    instructions: 'Lie on back, raise legs toward ceiling',
    isCustom: false,
  },
  {
    name: 'Russian Twist',
    description: 'Rotational core exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Bodyweight or Medicine Ball',
    instructions: 'Sit with feet off ground, twist torso side to side',
    isCustom: false,
  },
  {
    name: 'Cable Crunch',
    description: 'Weighted ab exercise',
    category: 'strength',
    muscleGroups: ['Core'],
    equipment: 'Cable Machine',
    instructions: 'Kneel facing cable machine, crunch down by contracting abs',
    isCustom: false,
  },

  // Cardio Exercises (5)
  {
    name: 'Running',
    description: 'Cardiovascular endurance exercise',
    category: 'cardio',
    muscleGroups: ['Legs', 'Full Body'],
    equipment: 'None',
    instructions: 'Run at various intensities for cardiovascular fitness',
    isCustom: false,
  },
  {
    name: 'Cycling',
    description: 'Low-impact cardio',
    category: 'cardio',
    muscleGroups: ['Legs'],
    equipment: 'Bike',
    instructions: 'Cycle at various intensities for cardiovascular fitness',
    isCustom: false,
  },
  {
    name: 'Rowing',
    description: 'Full-body cardio exercise',
    category: 'cardio',
    muscleGroups: ['Full Body'],
    equipment: 'Rowing Machine',
    instructions: 'Row with proper form for cardiovascular fitness',
    isCustom: false,
  },
  {
    name: 'Jump Rope',
    description: 'High-intensity cardio',
    category: 'cardio',
    muscleGroups: ['Legs', 'Full Body'],
    equipment: 'Jump Rope',
    instructions: 'Jump rope at various speeds and patterns',
    isCustom: false,
  },
  {
    name: 'Burpees',
    description: 'Full-body conditioning exercise',
    category: 'cardio',
    muscleGroups: ['Full Body'],
    equipment: 'Bodyweight',
    instructions: 'Drop to push-up position, perform push-up, jump to standing, jump up',
    isCustom: false,
  },
];

async function main() {
  console.log('Starting seed...');
  console.log(`Seeding ${exercises.length} exercises...`);

  let created = 0;
  let skipped = 0;

  for (const exercise of exercises) {
    // Check if exercise already exists
    const existing = await prisma.exercise.findFirst({
      where: {
        name: exercise.name,
        userId: null, // system exercise
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Create new exercise
    await prisma.exercise.create({
      data: exercise,
    });
    created++;
  }

  console.log(`✓ Created ${created} new exercises`);
  console.log(`✓ Skipped ${skipped} existing exercises`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
