import api from './api';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: string;
  muscleGroups: string[];
  equipment: string | null;
  instructions: string | null;
  isCustom: boolean;
}

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  search?: string;
}

export interface CreateExerciseData {
  name: string;
  description?: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
}

export const exerciseService = {
  // Get all exercises with optional filters
  async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/exercises?${queryString}` : '/api/exercises';

    const response = await api.get(url);
    return response.data.exercises;
  },

  // Create custom exercise
  async createExercise(data: CreateExerciseData): Promise<Exercise> {
    const response = await api.post('/api/exercises', data);
    return response.data.exercise;
  },

  // Update custom exercise
  async updateExercise(id: string, data: Partial<CreateExerciseData>): Promise<Exercise> {
    const response = await api.put(`/api/exercises/${id}`, data);
    return response.data.exercise;
  },

  // Delete custom exercise
  async deleteExercise(id: string): Promise<void> {
    await api.delete(`/api/exercises/${id}`);
  },
};
