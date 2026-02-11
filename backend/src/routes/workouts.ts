import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// GET /api/workouts - List user's workouts
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate, limit = '20', offset = '0' } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        include: {
          sets: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { date: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.workout.count({ where }),
    ]);

    res.json({ workouts, total });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// GET /api/workouts/:id - Get single workout
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: { id, userId },
      include: {
        sets: {
          include: {
            exercise: true,
          },
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// POST /api/workouts - Create workout with sets (atomic)
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { name, date, notes, durationMinutes, sets } = req.body;

    // Validation
    if (!name || !date) {
      return res.status(400).json({
        error: 'Missing required fields: name, date'
      });
    }

    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({
        error: 'Workout must have at least one set'
      });
    }

    // Validate sets
    for (const set of sets) {
      if (!set.exerciseId || !set.setNumber || !set.reps || set.weight === undefined) {
        return res.status(400).json({
          error: 'Invalid set data: exerciseId, setNumber, reps, and weight are required'
        });
      }
    }

    // Create workout + sets in transaction
    const workout = await prisma.$transaction(async (tx) => {
      const newWorkout = await tx.workout.create({
        data: {
          userId,
          name,
          date: new Date(date),
          notes,
          durationMinutes,
        },
      });

      await tx.set.createMany({
        data: sets.map((set: any) => ({
          workoutId: newWorkout.id,
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          weightUnit: set.weightUnit || 'lbs',
          notes: set.notes,
        })),
      });

      return tx.workout.findUnique({
        where: { id: newWorkout.id },
        include: {
          sets: {
            include: {
              exercise: true,
            },
            orderBy: { setNumber: 'asc' },
          },
        },
      });
    });

    res.status(201).json({ workout });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// PUT /api/workouts/:id - Update workout
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { name, date, notes, durationMinutes, sets } = req.body;

    // Check ownership
    const existingWorkout = await prisma.workout.findFirst({
      where: { id, userId },
    });

    if (!existingWorkout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Update in transaction (delete old sets, create new ones)
    const workout = await prisma.$transaction(async (tx) => {
      await tx.set.deleteMany({
        where: { workoutId: id },
      });

      const updatedWorkout = await tx.workout.update({
        where: { id },
        data: {
          name,
          date: new Date(date),
          notes,
          durationMinutes,
        },
      });

      if (sets && sets.length > 0) {
        await tx.set.createMany({
          data: sets.map((set: any) => ({
            workoutId: id,
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            weightUnit: set.weightUnit || 'lbs',
            notes: set.notes,
          })),
        });
      }

      return tx.workout.findUnique({
        where: { id },
        include: {
          sets: {
            include: {
              exercise: true,
            },
            orderBy: { setNumber: 'asc' },
          },
        },
      });
    });

    res.json({ workout });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// DELETE /api/workouts/:id - Delete workout
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    // Check ownership
    const workout = await prisma.workout.findFirst({
      where: { id, userId },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Sets will be cascade deleted
    await prisma.workout.delete({
      where: { id },
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

export default router;
