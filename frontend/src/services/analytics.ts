import api from './api';

export interface ProgressDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  sets: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: string;
}

export interface WorkoutFrequency {
  week: string;
  count: number;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
  sets: number;
}

export interface SummaryStats {
  totalWorkouts: number;
  uniqueExercises: number;
  currentStreak: number;
  lastWorkout: {
    date: string;
    name: string;
  } | null;
}

export const analyticsService = {
  // Get exercise progress over time
  async getExerciseProgress(
    exerciseId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProgressDataPoint[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/api/analytics/progress/${exerciseId}?${queryString}`
      : `/api/analytics/progress/${exerciseId}`;

    const response = await api.get(url);
    return response.data.progress;
  },

  // Get personal records
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const response = await api.get('/api/analytics/personal-records');
    return response.data.personalRecords;
  },

  // Get workout frequency
  async getWorkoutFrequency(startDate?: string, endDate?: string): Promise<WorkoutFrequency[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/api/analytics/workout-frequency?${queryString}`
      : '/api/analytics/workout-frequency';

    const response = await api.get(url);
    return response.data.frequency;
  },

  // Get volume over time
  async getVolume(
    startDate?: string,
    endDate?: string,
    exerciseId?: string
  ): Promise<VolumeDataPoint[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (exerciseId) params.append('exerciseId', exerciseId);

    const queryString = params.toString();
    const url = queryString ? `/api/analytics/volume?${queryString}` : '/api/analytics/volume';

    const response = await api.get(url);
    return response.data.volumeData;
  },

  // Get summary statistics
  async getSummary(): Promise<SummaryStats> {
    const response = await api.get('/api/analytics/summary');
    return response.data.summary;
  },
};
