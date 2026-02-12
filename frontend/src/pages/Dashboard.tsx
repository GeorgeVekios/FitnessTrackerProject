import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Pencil, BookmarkPlus, Trash2, Plus } from 'lucide-react';
import { authService, type User } from '../services/auth';
import { workoutService, type Workout } from '../services/workouts';
import { templateService } from '../services/templates';
import NavBar from '../components/NavBar';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const navigate = useNavigate();

  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; workoutId: string | null }>({
    isOpen: false,
    workoutId: null,
  });
  const [templatePrompt, setTemplatePrompt] = useState<{
    isOpen: boolean;
    workoutId: string | null;
    workoutName: string;
  }>({
    isOpen: false,
    workoutId: null,
    workoutName: '',
  });

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
      toast.error('Failed to load workouts');
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!deleteConfirm.workoutId) return;

    try {
      await workoutService.deleteWorkout(deleteConfirm.workoutId);
      setWorkouts(workouts.filter((w) => w.id !== deleteConfirm.workoutId));
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Failed to delete workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleSaveAsTemplate = async (templateName: string) => {
    if (!templatePrompt.workoutId) return;

    try {
      const workout = await workoutService.getWorkout(templatePrompt.workoutId);

      const exerciseGroups = workout.sets.reduce(
        (acc, set) => {
          if (!acc[set.exercise.id]) {
            acc[set.exercise.id] = {
              exerciseId: set.exercise.id,
              sets: [],
            };
          }
          acc[set.exercise.id].sets.push(set);
          return acc;
        },
        {} as Record<string, { exerciseId: string; sets: typeof workout.sets }>
      );

      const templateExercises = Object.values(exerciseGroups).map((group, index) => {
        const avgReps = Math.round(
          group.sets.reduce((sum, set) => sum + set.reps, 0) / group.sets.length
        );
        const avgWeight =
          group.sets.reduce((sum, set) => sum + set.weight, 0) / group.sets.length;

        return {
          exerciseId: group.exerciseId,
          orderIndex: index,
          defaultSets: group.sets.length,
          defaultReps: avgReps,
          defaultWeight: avgWeight,
        };
      });

      await templateService.createTemplate({
        name: templateName,
        description: `Template created from workout on ${new Date(
          workout.date
        ).toLocaleDateString()}`,
        exercises: templateExercises,
      });

      toast.success('Template created successfully!');
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">Recent Workouts</h2>
          {workoutsLoading ? (
            <div className="text-center py-12">
              <div className="spinner"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-slate-400 mb-4">
                No workouts yet. Start tracking your fitness journey!
              </p>
              <button
                onClick={() => navigate('/log-workout')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Your First Workout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div key={workout.id} className="card-hover p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div>
                      <h5 className="text-lg font-semibold text-slate-100 mb-1">
                        {workout.name}
                      </h5>
                      <p className="text-sm text-slate-400">
                        {new Date(workout.date).toLocaleDateString()}
                        {workout.durationMinutes && ` • ${workout.durationMinutes} min`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/workout/${workout.id}`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 btn-primary text-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-workout/${workout.id}`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setTemplatePrompt({
                            isOpen: true,
                            workoutId: workout.id,
                            workoutName: workout.name,
                          })
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 btn-secondary text-sm whitespace-nowrap"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        Save as Template
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, workoutId: workout.id })
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 btn-danger text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-cyan-300 italic">"{workout.notes}"</p>
                    </div>
                  )}

                  <div>
                    <span className="block text-sm font-medium text-slate-300 mb-2">Exercises:</span>
                    <ul className="space-y-1 text-slate-400">
                      {Object.entries(
                        workout.sets.reduce(
                          (acc, set) => {
                            const exerciseName = set.exercise.name;
                            if (!acc[exerciseName]) {
                              acc[exerciseName] = [];
                            }
                            acc[exerciseName].push(set);
                            return acc;
                          },
                          {} as Record<string, typeof workout.sets>
                        )
                      ).map(([exerciseName, sets]) => (
                        <li key={exerciseName} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, workoutId: null })}
        onConfirm={handleDeleteWorkout}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="bg-rose-600 hover:bg-rose-500 hover:shadow-glow-rose"
      />

      {/* Save as Template Prompt Modal */}
      <PromptModal
        isOpen={templatePrompt.isOpen}
        onClose={() =>
          setTemplatePrompt({ isOpen: false, workoutId: null, workoutName: '' })
        }
        onConfirm={handleSaveAsTemplate}
        title="Save as Template"
        message="Enter a name for this template:"
        defaultValue={templatePrompt.workoutName}
        placeholder="e.g., Push Day, Pull Day, Leg Day"
        confirmText="Create Template"
      />
    </>
  );
}
