import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Get exercise progress over time (weight progression)
router.get('/progress/:exerciseId', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { exerciseId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause: any = {
      workout: {
        userId,
      },
      exerciseId,
    };

    if (startDate || endDate) {
      whereClause.workout.date = {};
      if (startDate) whereClause.workout.date.gte = new Date(startDate as string);
      if (endDate) whereClause.workout.date.lte = new Date(endDate as string);
    }

    const sets = await prisma.set.findMany({
      where: whereClause,
      include: {
        workout: {
          select: {
            date: true,
            name: true,
          },
        },
      },
      orderBy: {
        workout: {
          date: 'asc',
        },
      },
    });

    // Group by date and find max weight per workout
    const progressData = sets.reduce((acc: any[], set) => {
      const date = set.workout.date.toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);

      // Convert weight to lbs for consistency
      const weightInLbs = set.weightUnit === 'kg' ? set.weight * 2.20462 : set.weight;

      if (!existing) {
        acc.push({
          date,
          maxWeight: weightInLbs,
          totalVolume: weightInLbs * set.reps,
          totalReps: set.reps,
          sets: 1,
        });
      } else {
        existing.maxWeight = Math.max(existing.maxWeight, weightInLbs);
        existing.totalVolume += weightInLbs * set.reps;
        existing.totalReps += set.reps;
        existing.sets += 1;
      }

      return acc;
    }, []);

    res.json({ progress: progressData });
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
    res.status(500).json({ error: 'Failed to fetch exercise progress' });
  }
});

// Get personal records for all exercises
router.get('/personal-records', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    const sets = await prisma.set.findMany({
      where: {
        workout: {
          userId,
        },
      },
      include: {
        exercise: true,
        workout: {
          select: {
            date: true,
          },
        },
      },
    });

    // Group by exercise and find max weight
    const prsMap = new Map<string, any>();

    sets.forEach(set => {
      const exerciseId = set.exercise.id;
      const weightInLbs = set.weightUnit === 'kg' ? set.weight * 2.20462 : set.weight;

      if (!prsMap.has(exerciseId)) {
        prsMap.set(exerciseId, {
          exerciseId,
          exerciseName: set.exercise.name,
          maxWeight: weightInLbs,
          reps: set.reps,
          date: set.workout.date,
        });
      } else {
        const current = prsMap.get(exerciseId);
        // Compare by weight, if equal prefer higher reps
        if (weightInLbs > current.maxWeight ||
            (weightInLbs === current.maxWeight && set.reps > current.reps)) {
          prsMap.set(exerciseId, {
            exerciseId,
            exerciseName: set.exercise.name,
            maxWeight: weightInLbs,
            reps: set.reps,
            date: set.workout.date,
          });
        }
      }
    });

    const prs = Array.from(prsMap.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    );

    res.json({ personalRecords: prs });
  } catch (error) {
    console.error('Error fetching personal records:', error);
    res.status(500).json({ error: 'Failed to fetch personal records' });
  }
});

// Get workout frequency (workouts per week)
router.get('/workout-frequency', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate } = req.query;

    const whereClause: any = {
      userId,
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      select: {
        date: true,
        name: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by week
    const frequencyData = workouts.reduce((acc: any[], workout) => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      const existing = acc.find(item => item.week === weekKey);
      if (!existing) {
        acc.push({
          week: weekKey,
          count: 1,
        });
      } else {
        existing.count += 1;
      }

      return acc;
    }, []);

    res.json({ frequency: frequencyData });
  } catch (error) {
    console.error('Error fetching workout frequency:', error);
    res.status(500).json({ error: 'Failed to fetch workout frequency' });
  }
});

// Get volume over time (total weight lifted)
router.get('/volume', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate, exerciseId } = req.query;

    const whereClause: any = {
      workout: {
        userId,
      },
    };

    if (exerciseId) {
      whereClause.exerciseId = exerciseId as string;
    }

    if (startDate || endDate) {
      whereClause.workout.date = {};
      if (startDate) whereClause.workout.date.gte = new Date(startDate as string);
      if (endDate) whereClause.workout.date.lte = new Date(endDate as string);
    }

    const sets = await prisma.set.findMany({
      where: whereClause,
      include: {
        workout: {
          select: {
            date: true,
          },
        },
      },
    });

    // Group by date and calculate total volume
    const volumeData = sets.reduce((acc: any[], set) => {
      const date = set.workout.date.toISOString().split('T')[0];
      const weightInLbs = set.weightUnit === 'kg' ? set.weight * 2.20462 : set.weight;
      const volume = weightInLbs * set.reps;

      const existing = acc.find(item => item.date === date);
      if (!existing) {
        acc.push({
          date,
          volume,
          sets: 1,
        });
      } else {
        existing.volume += volume;
        existing.sets += 1;
      }

      return acc;
    }, []);

    res.json({ volumeData });
  } catch (error) {
    console.error('Error fetching volume data:', error);
    res.status(500).json({ error: 'Failed to fetch volume data' });
  }
});

// Get workout statistics summary
router.get('/summary', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    // Get total workouts
    const totalWorkouts = await prisma.workout.count({
      where: { userId },
    });

    // Get total exercises (unique)
    const sets = await prisma.set.findMany({
      where: {
        workout: {
          userId,
        },
      },
      select: {
        exerciseId: true,
      },
    });

    const uniqueExercises = new Set(sets.map(s => s.exerciseId)).size;

    // Get current streak (consecutive days with workouts)
    const recentWorkouts = await prisma.workout.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
      take: 100,
    });

    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const workout of recentWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        lastDate = workoutDate;
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          currentStreak++;
          lastDate = workoutDate;
        } else if (dayDiff > 1) {
          break;
        }
      }
    }

    // Get most recent workout
    const lastWorkout = await prisma.workout.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        name: true,
      },
    });

    res.json({
      summary: {
        totalWorkouts,
        uniqueExercises,
        currentStreak,
        lastWorkout: lastWorkout ? {
          date: lastWorkout.date,
          name: lastWorkout.name,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
