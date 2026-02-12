import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Get all templates for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    const templates = await prisma.template.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const template = await prisma.template.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create new template
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { name, description, exercises } = req.body;

    if (!name || !exercises || exercises.length === 0) {
      return res.status(400).json({ error: 'Name and exercises are required' });
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        userId,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            exerciseId: ex.exerciseId,
            orderIndex: index,
            defaultSets: ex.defaultSets,
            defaultReps: ex.defaultReps,
            defaultWeight: ex.defaultWeight,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { name, description, exercises } = req.body;

    // Verify template belongs to user
    const existingTemplate = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!name || !exercises || exercises.length === 0) {
      return res.status(400).json({ error: 'Name and exercises are required' });
    }

    // Update template and replace exercises in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Delete existing template exercises
      await tx.templateExercise.deleteMany({
        where: { templateId: id },
      });

      // Update template and create new exercises
      return tx.template.update({
        where: { id },
        data: {
          name,
          description,
          exercises: {
            create: exercises.map((ex: any, index: number) => ({
              exerciseId: ex.exerciseId,
              orderIndex: index,
              defaultSets: ex.defaultSets,
              defaultReps: ex.defaultReps,
              defaultWeight: ex.defaultWeight,
              notes: ex.notes,
            })),
          },
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });

    res.json({ template });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const template = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await prisma.template.delete({
      where: { id },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
