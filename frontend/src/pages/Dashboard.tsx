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
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Fitness Tracker Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user?.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt={user.name}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
          )}
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</button>
        </div>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/log-workout')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Log Workout
        </button>
      </div>

      <div>
        <h2>Recent Workouts</h2>
        {workoutsLoading ? (
          <div>Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #ddd', borderRadius: '8px', color: '#666' }}>
            <p>No workouts yet. Start tracking your fitness journey!</p>
            <button
              onClick={() => navigate('/log-workout')}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Log Your First Workout
            </button>
          </div>
        ) : (
          <div>
            {workouts.map((workout) => (
              <div
                key={workout.id}
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{workout.name}</h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(workout.date).toLocaleDateString()}
                      {workout.durationMinutes && ` • ${workout.durationMinutes} min`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate(`/workout/${workout.id}`)}
                      style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {workout.notes && (
                  <div style={{ fontSize: '14px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>
                    "{workout.notes}"
                  </div>
                )}

                <div style={{ fontSize: '14px' }}>
                  <strong>Exercises:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {/* Group sets by exercise */}
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
