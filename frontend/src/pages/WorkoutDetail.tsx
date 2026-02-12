import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, type User } from '../services/auth';
import { workoutService, type Workout } from '../services/workouts';
import NavBar from '../components/NavBar';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
      }
    };

    fetchUser();
    if (id) {
      loadWorkout(id);
    }
  }, [id, navigate]);

  const loadWorkout = async (workoutId: string) => {
    try {
      const data = await workoutService.getWorkout(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
      toast.error('Failed to load workout');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar user={user} />
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <NavBar user={user} />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="bg-amber-950/30 border border-amber-900/50 text-amber-300 px-4 py-3 rounded-lg">
            Workout not found
          </div>
        </div>
      </>
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
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="card p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-3">{workout.name}</h1>
          <p className="text-slate-400 mb-3">
            {new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {workout.durationMinutes && ` • ${workout.durationMinutes} minutes`}
          </p>
          {workout.notes && (
            <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-4">
              <em className="text-cyan-300">{workout.notes}</em>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Exercises</h2>

        {Object.values(exerciseGroups).map(({ exercise, sets }) => (
          <div key={exercise.id} className="card p-4 sm:p-6 mb-4">
            <h5 className="text-xl font-semibold text-slate-100 mb-2">{exercise.name}</h5>
            <p className="text-sm text-slate-400 mb-4">
              {exercise.category} • {exercise.muscleGroups.join(', ')}
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700 border border-slate-700">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Set</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Reps</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Weight</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sets.map((set) => (
                    <tr key={set.id}>
                      <td className="px-3 sm:px-4 py-2 text-sm text-slate-300">{set.setNumber}</td>
                      <td className="px-3 sm:px-4 py-2 text-sm text-slate-300">{set.reps}</td>
                      <td className="px-3 sm:px-4 py-2 text-sm text-slate-300 whitespace-nowrap">{set.weight} {set.weightUnit}</td>
                      <td className="px-3 sm:px-4 py-2 text-sm text-slate-400">{set.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
