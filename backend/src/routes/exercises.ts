import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// GET /api/exercises - List exercises with filters
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { category, muscleGroup, search } = req.query;
    const userId = (req.user as any).id;

    const where: any = {
      OR: [
        { userId: null },      // System exercises
        { userId: userId },    // User's custom exercises
      ],
    };

    if (category) {
      where.category = category;
    }

    if (muscleGroup) {
      where.muscleGroups = {
        has: muscleGroup as string,
      };
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { isCustom: 'asc' },  // System exercises first
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        muscleGroups: true,
        equipment: true,
        instructions: true,
        isCustom: true,
      },
    });

    res.json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// POST /api/exercises - Create custom exercise
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { name, description, category, muscleGroups, equipment, instructions } = req.body;

    // Validation
    if (!name || !category || !muscleGroups || muscleGroups.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: name, category, muscleGroups'
      });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        category,
        muscleGroups,
        equipment,
        instructions,
        isCustom: true,
        userId,
      },
    });

    res.status(201).json({ exercise });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

export default router;
