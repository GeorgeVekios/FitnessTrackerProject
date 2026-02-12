import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, type User } from '../services/auth';
import { exerciseService, type Exercise } from '../services/exercises';
import { workoutService, type CreateWorkoutData, type WorkoutSet } from '../services/workouts';
import { templateService } from '../services/templates';
import NavBar from '../components/NavBar';

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
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const isEditMode = !!id;

  // User state
  const [user, setUser] = useState<User | null>(null);

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

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Check authentication on mount
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
  }, [navigate]);

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Filter exercises when search/category changes
  useEffect(() => {
    filterExercises();
  }, [searchTerm, categoryFilter, availableExercises]);

  // Load workout data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadWorkoutForEdit(id);
    }
  }, [id, isEditMode]);

  // Load from template if template ID is provided
  useEffect(() => {
    if (templateId) {
      loadFromTemplate(templateId);
    }
  }, [templateId]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const exercises = await exerciseService.getExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      toast.error('Failed to load exercises');
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

  const loadWorkoutForEdit = async (workoutId: string) => {
    setLoading(true);
    try {
      const workout = await workoutService.getWorkout(workoutId);

      // Set workout metadata
      setWorkoutName(workout.name);
      setWorkoutDate(new Date(workout.date).toISOString().split('T')[0]);
      setWorkoutNotes(workout.notes || '');
      setDurationMinutes(workout.durationMinutes || undefined);

      // Group sets by exercise
      const exerciseGroups: Record<string, WorkoutExercise> = {};

      workout.sets.forEach(set => {
        if (!exerciseGroups[set.exercise.id]) {
          exerciseGroups[set.exercise.id] = {
            exercise: set.exercise as Exercise,
            sets: [],
          };
        }
        exerciseGroups[set.exercise.id].sets.push({
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          weightUnit: set.weightUnit,
          notes: set.notes || '',
        });
      });

      // Convert to array and sort sets by set number
      const exercises = Object.values(exerciseGroups).map(group => ({
        ...group,
        sets: group.sets.sort((a, b) => a.setNumber - b.setNumber),
      }));

      setWorkoutExercises(exercises);
    } catch (error) {
      console.error('Failed to load workout:', error);
      toast.error('Failed to load workout for editing');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadFromTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const template = await templateService.getTemplate(templateId);

      // Set workout name from template
      setWorkoutName(template.name);

      // Convert template exercises to workout exercises
      const exercises: WorkoutExercise[] = template.exercises.map(te => ({
        exercise: te.exercise,
        sets: Array.from({ length: te.defaultSets || 3 }, (_, i) => ({
          setNumber: i + 1,
          reps: te.defaultReps || 0,
          weight: te.defaultWeight || 0,
          weightUnit: 'lbs' as const,
          notes: '',
        })),
      }));

      setWorkoutExercises(exercises);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (workoutExercises.length === 0) {
      toast.error('Please add at least one exercise to save as template');
      return;
    }

    try {
      await templateService.createTemplate({
        name: templateName,
        description: templateDescription || undefined,
        exercises: workoutExercises.map((we, index) => {
          // Calculate average reps and weight from sets
          const avgReps = Math.round(
            we.sets.reduce((sum, set) => sum + set.reps, 0) / we.sets.length
          );
          const avgWeight =
            we.sets.reduce((sum, set) => sum + set.weight, 0) / we.sets.length;

          return {
            exerciseId: we.exercise.id,
            orderIndex: index,
            defaultSets: we.sets.length,
            defaultReps: avgReps,
            defaultWeight: avgWeight,
          };
        }),
      });

      toast.success('Template saved successfully!');
      setShowTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const addExercise = (exercise: Exercise) => {
    if (workoutExercises.some(we => we.exercise.id === exercise.id)) {
      toast.error('Exercise already added to workout');
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
    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    if (workoutExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    for (const we of workoutExercises) {
      for (const set of we.sets) {
        if (set.reps <= 0 || set.weight < 0) {
          toast.error(`Invalid set data for ${we.exercise.name}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
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

      if (isEditMode && id) {
        await workoutService.updateWorkout(id, workoutData);
        toast.success('Workout updated successfully!');
      } else {
        await workoutService.createWorkout(workoutData);
        toast.success('Workout saved successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save workout:', error);
      toast.error('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Workout' : 'Log Workout'}
        </h1>

      {/* Workout Metadata Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h5 className="text-xl font-semibold text-gray-900 mb-4">Workout Details</h5>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Chest & Triceps"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={durationMinutes || ''}
              onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="How did you feel? Any observations?"
            rows={3}
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Exercises</h2>
        <button
          onClick={() => setShowExerciseSelector(!showExerciseSelector)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {showExerciseSelector ? 'Close' : 'Add Exercise'}
        </button>
      </div>

      {/* Exercise Selector Card */}
      {showExerciseSelector && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading exercises...</div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No exercises found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{exercise.name}</div>
                    <div className="text-sm text-gray-600">
                      {exercise.category} • {exercise.muscleGroups.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workout Exercises */}
      {workoutExercises.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No exercises added yet. Click "Add Exercise" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutExercises.map((we) => (
            <div key={we.exercise.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-gray-900">{we.exercise.name}</h5>
                <button
                  onClick={() => removeExercise(we.exercise.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Set</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Reps</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Weight</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Unit</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Notes</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {we.sets.map((set) => (
                      <tr key={set.setNumber} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-sm text-gray-900">{set.setNumber}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={set.reps}
                            onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'reps', Number(e.target.value))}
                            min="0"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={set.weight}
                            onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'weight', Number(e.target.value))}
                            min="0"
                            step="0.5"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={set.weightUnit}
                            onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'weightUnit', e.target.value)}
                          >
                            <option value="lbs">lbs</option>
                            <option value="kg">kg</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={set.notes}
                            onChange={(e) => updateSet(we.exercise.id, set.setNumber, 'notes', e.target.value)}
                            placeholder="Optional"
                          />
                        </td>
                        <td className="py-2 px-2">
                          {we.sets.length > 1 && (
                            <button
                              onClick={() => removeSet(we.exercise.id, set.setNumber)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => addSet(we.exercise.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add Set
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6">
        <button
          onClick={() => setShowTemplateModal(true)}
          disabled={workoutExercises.length === 0}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save as Template
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveWorkout}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Workout' : 'Save Workout'}
          </button>
        </div>
      </div>

      {/* Save as Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Save as Template</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Pull Day, Leg Day"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this template..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAsTemplate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
