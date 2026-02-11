import api from './api';
import type { Exercise } from './exercises';

export interface WorkoutSet {
  id?: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  notes?: string;
  exercise?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  notes: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  sets: Array<WorkoutSet & { exercise: Exercise }>;
}

export interface CreateWorkoutData {
  name: string;
  date: string;
  notes?: string;
  durationMinutes?: number;
  sets: Omit<WorkoutSet, 'id' | 'exercise'>[];
}

export interface WorkoutFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const workoutService = {
  // Get workouts with filters
  async getWorkouts(filters?: WorkoutFilters): Promise<{ workouts: Workout[], total: number }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `/api/workouts?${queryString}` : '/api/workouts';

    const response = await api.get(url);
    return response.data;
  },

  // Get single workout
  async getWorkout(id: string): Promise<Workout> {
    const response = await api.get(`/api/workouts/${id}`);
    return response.data.workout;
  },

  // Create workout
  async createWorkout(data: CreateWorkoutData): Promise<Workout> {
    const response = await api.post('/api/workouts', data);
    return response.data.workout;
  },

  // Update workout
  async updateWorkout(id: string, data: CreateWorkoutData): Promise<Workout> {
    const response = await api.put(`/api/workouts/${id}`, data);
    return response.data.workout;
  },

  // Delete workout
  async deleteWorkout(id: string): Promise<void> {
    await api.delete(`/api/workouts/${id}`);
  },
};
