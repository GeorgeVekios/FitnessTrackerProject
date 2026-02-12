import { useEffect, useState } from 'react';
import { authService, type User } from '../services/auth';
import { workoutService, type Workout } from '../services/workouts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  const loadWorkouts = async () => {
    setWorkoutsLoading(true);
    try {
      const { workouts } = await workoutService.getWorkouts({ limit: 10 });
      setWorkouts(workouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutService.deleteWorkout(id);
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 my-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Tracker Dashboard</h1>
        <div className="flex items-center gap-4">
          {user?.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt={user.name}
              className="rounded-full w-10 h-10"
            />
          )}
          <span className="text-gray-700">Welcome, {user?.name}!</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mb-6">
        <button
          onClick={() => navigate('/log-workout')}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          + Log Workout
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Workouts</h2>
        {workoutsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No workouts yet. Start tracking your fitness journey!</p>
            <button
              onClick={() => navigate('/log-workout')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Log Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-1">{workout.name}</h5>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString()}
                      {workout.durationMinutes && ` • ${workout.durationMinutes} min`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/workout/${workout.id}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-workout/${workout.id}`)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {workout.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                    <p className="text-sm text-blue-900 italic">"{workout.notes}"</p>
                  </div>
                )}

                <div>
                  <strong className="block text-gray-900 mb-2">Exercises:</strong>
                  <ul className="list-disc list-inside text-gray-700">
                    {Object.entries(
                      workout.sets.reduce((acc, set) => {
                        const exerciseName = set.exercise.name;
                        if (!acc[exerciseName]) {
                          acc[exerciseName] = [];
                        }
                        acc[exerciseName].push(set);
                        return acc;
                      }, {} as Record<string, typeof workout.sets>)
                    ).map(([exerciseName, sets]) => (
                      <li key={exerciseName}>
                        {exerciseName}: {sets.length} set{sets.length > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
