import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService, type Workout } from '../services/workouts';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkout(id);
    }
  }, [id]);

  const loadWorkout = async (workoutId: string) => {
    try {
      const data = await workoutService.getWorkout(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
      alert('Failed to load workout');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 my-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 my-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Workout not found
        </div>
      </div>
    );
  }

  // Group sets by exercise
  const exerciseGroups = workout.sets.reduce((acc, set) => {
    const exerciseId = set.exercise.id;
    if (!acc[exerciseId]) {
      acc[exerciseId] = {
        exercise: set.exercise,
        sets: [],
      };
    }
    acc[exerciseId].sets.push(set);
    return acc;
  }, {} as Record<string, { exercise: typeof workout.sets[0]['exercise'], sets: typeof workout.sets }>);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{workout.name}</h1>
        <p className="text-gray-600 mb-3">
          {new Date(workout.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {workout.durationMinutes && ` • ${workout.durationMinutes} minutes`}
        </p>
        {workout.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <em className="text-blue-900">{workout.notes}</em>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exercises</h2>

      {Object.values(exerciseGroups).map(({ exercise, sets }) => (
        <div key={exercise.id} className="bg-white rounded-lg shadow p-6 mb-4">
          <h5 className="text-xl font-semibold text-gray-900 mb-2">{exercise.name}</h5>
          <p className="text-sm text-gray-600 mb-4">
            {exercise.category} • {exercise.muscleGroups.join(', ')}
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Set</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reps</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sets.map((set) => (
                  <tr key={set.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{set.setNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{set.reps}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{set.weight} {set.weightUnit}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{set.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
