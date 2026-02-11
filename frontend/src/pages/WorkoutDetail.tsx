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
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!workout) {
    return <div style={{ padding: '20px' }}>Workout not found</div>;
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>{workout.name}</h1>
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
          {new Date(workout.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {workout.durationMinutes && ` • ${workout.durationMinutes} minutes`}
        </div>
        {workout.notes && (
          <div style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontStyle: 'italic',
            marginBottom: '10px'
          }}>
            {workout.notes}
          </div>
        )}
      </div>

      <h2 style={{ marginBottom: '20px' }}>Exercises</h2>

      {Object.values(exerciseGroups).map(({ exercise, sets }) => (
        <div key={exercise.id} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px' }}>{exercise.name}</h3>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            {exercise.category} • {exercise.muscleGroups.join(', ')}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Set</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Reps</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Weight</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{set.setNumber}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{set.reps}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {set.weight} {set.weightUnit}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {set.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
