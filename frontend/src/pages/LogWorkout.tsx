import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseService, type Exercise } from '../services/exercises';
import { workoutService, type CreateWorkoutData, type WorkoutSet } from '../services/workouts';

// Interface for client-side set (before saving)
interface WorkoutExercise {
  exercise: Exercise;
  sets: Array<{
    setNumber: number;
    reps: number;
    weight: number;
    weightUnit: 'lbs' | 'kg';
    notes: string;
  }>;
}

export default function LogWorkout() {
  const navigate = useNavigate();

  // Workout metadata
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();

  // Exercise selection
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Workout exercises and sets
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Filter exercises when search/category changes
  useEffect(() => {
    filterExercises();
  }, [searchTerm, categoryFilter, availableExercises]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const exercises = await exerciseService.getExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      alert('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = availableExercises;

    if (categoryFilter) {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(search)
      );
    }

    setFilteredExercises(filtered);
  };

  const addExercise = (exercise: Exercise) => {
    // Check if already added
    if (workoutExercises.some(we => we.exercise.id === exercise.id)) {
      alert('Exercise already added to workout');
      return;
    }

    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise,
        sets: [{ setNumber: 1, reps: 0, weight: 0, weightUnit: 'lbs', notes: '' }],
      },
    ]);

    setShowExerciseSelector(false);
    setSearchTerm('');
    setCategoryFilter('');
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.filter(we => we.exercise.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.map(we => {
      if (we.exercise.id === exerciseId) {
        const lastSet = we.sets[we.sets.length - 1];
        return {
          ...we,
          sets: [
            ...we.sets,
            {
              setNumber: we.sets.length + 1,
              reps: lastSet?.reps || 0,
              weight: lastSet?.weight || 0,
              weightUnit: lastSet?.weightUnit || 'lbs',
              notes: '',
            },
          ],
        };
      }
      return we;
    }));
  };

  const updateSet = (
    exerciseId: string,
    setNumber: number,
    field: 'reps' | 'weight' | 'weightUnit' | 'notes',
    value: any
  ) => {
    setWorkoutExercises(workoutExercises.map(we => {
      if (we.exercise.id === exerciseId) {
        return {
          ...we,
          sets: we.sets.map(set =>
            set.setNumber === setNumber
              ? { ...set, [field]: value }
              : set
          ),
        };
      }
      return we;
    }));
  };

  const removeSet = (exerciseId: string, setNumber: number) => {
    setWorkoutExercises(workoutExercises.map(we => {
      if (we.exercise.id === exerciseId) {
        const newSets = we.sets
          .filter(set => set.setNumber !== setNumber)
          .map((set, index) => ({ ...set, setNumber: index + 1 }));
        return { ...we, sets: newSets };
      }
      return we;
    }));
  };

  const saveWorkout = async () => {
    // Validation
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    // Check all sets have valid data
    for (const we of workoutExercises) {
      for (const set of we.sets) {
        if (set.reps <= 0 || set.weight < 0) {
          alert(`Invalid set data for ${we.exercise.name}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Flatten sets for API
      const allSets: Omit<WorkoutSet, 'id' | 'exercise'>[] = [];

      workoutExercises.forEach(we => {
        we.sets.forEach(set => {
          allSets.push({
            exerciseId: we.exercise.id,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            weightUnit: set.weightUnit,
            notes: set.notes || undefined,
          });
        });
      });

      const workoutData: CreateWorkoutData = {
        name: workoutName,
        date: new Date(workoutDate).toISOString(),
        notes: workoutNotes || undefined,
        durationMinutes: durationMinutes,
        sets: allSets,
      };

      await workoutService.createWorkout(workoutData);
      alert('Workout saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Log Workout</h1>

      {/* Workout Metadata */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Workout Name *
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Chest & Triceps"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Date *
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Duration (minutes)
            <input
              type="number"
              value={durationMinutes || ''}
              onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Optional"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div>
          <label>
            Notes
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did you feel? Any observations?"
              rows={3}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
      </div>

      {/* Exercises Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Exercises</h2>
          <button
            onClick={() => setShowExerciseSelector(!showExerciseSelector)}
            style={{ padding: '10px 20px', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showExerciseSelector ? 'Close' : 'Add Exercise'}
          </button>
        </div>

        {/* Exercise Selector */}
        {showExerciseSelector && (
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">All Categories</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading exercises...</div>
              ) : filteredExercises.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>No exercises found</div>
              ) : (
                filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 'bold' }}>{exercise.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {exercise.category} • {exercise.muscleGroups.join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Workout Exercises with Sets */}
        {workoutExercises.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #ddd', borderRadius: '8px', color: '#666' }}>
            No exercises added yet. Click "Add Exercise" to get started.
          </div>
        ) : (
          workoutExercises.map((we) => (
            <div key={we.exercise.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>{we.exercise.name}</h3>
                <button
                  onClick={() => removeExercise(we.exercise.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>

              {/* Sets Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Set</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Reps</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Weight</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Unit</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Notes</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {we.sets.map((set) => (
                    <tr key={set.setNumber}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{set.setNumber}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'reps', Number(e.target.value))}
                          style={{ width: '60px', padding: '4px' }}
                          min="0"
                        />
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'weight', Number(e.target.value))}
                          style={{ width: '80px', padding: '4px' }}
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <select
                          value={set.weightUnit}
                          onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'weightUnit', e.target.value)}
                          style={{ padding: '4px' }}
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={set.notes}
                          onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'notes', e.target.value)}
                          placeholder="Optional"
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {we.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(we.exercise.id, set.setNumber)}
                            style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => addSet(we.exercise.id)}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Add Set
              </button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={saveWorkout}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: saving ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
}
