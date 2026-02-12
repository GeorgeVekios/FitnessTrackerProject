import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { authService, type User } from '../services/auth';
import { exerciseService, type Exercise } from '../services/exercises';
import NavBar from '../components/NavBar';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

export default function Exercises() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('');

  // Create/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength' as 'strength' | 'cardio' | 'flexibility',
    muscleGroups: [] as string[],
    equipment: '',
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    exerciseId: string | null;
    exerciseName: string;
  }>({
    isOpen: false,
    exerciseId: null,
    exerciseName: '',
  });

  // Muscle group input
  const [muscleGroupInput, setMuscleGroupInput] = useState('');

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
    loadExercises();
  }, [navigate]);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, categoryFilter, muscleGroupFilter, exercises]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (categoryFilter) {
      filtered = filtered.filter((ex) => ex.category === categoryFilter);
    }

    if (muscleGroupFilter) {
      filtered = filtered.filter((ex) =>
        ex.muscleGroups.some((mg) =>
          mg.toLowerCase().includes(muscleGroupFilter.toLowerCase())
        )
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(search) ||
          ex.description?.toLowerCase().includes(search)
      );
    }

    setFilteredExercises(filtered);
  };

  const handleCreateExercise = () => {
    setEditingExercise(null);
    setFormData({
      name: '',
      description: '',
      category: 'strength',
      muscleGroups: [],
      equipment: '',
    });
    setMuscleGroupInput('');
    setShowModal(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      category: exercise.category as 'strength' | 'cardio' | 'flexibility',
      muscleGroups: [...exercise.muscleGroups],
      equipment: exercise.equipment || '',
    });
    setMuscleGroupInput('');
    setShowModal(true);
  };

  const handleAddMuscleGroup = () => {
    const trimmed = muscleGroupInput.trim();
    if (trimmed && !formData.muscleGroups.includes(trimmed)) {
      setFormData({
        ...formData,
        muscleGroups: [...formData.muscleGroups, trimmed],
      });
      setMuscleGroupInput('');
    }
  };

  const handleRemoveMuscleGroup = (muscleGroup: string) => {
    setFormData({
      ...formData,
      muscleGroups: formData.muscleGroups.filter((mg) => mg !== muscleGroup),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    if (formData.muscleGroups.length === 0) {
      toast.error('Please add at least one muscle group');
      return;
    }

    try {
      if (editingExercise) {
        await exerciseService.updateExercise(editingExercise.id, {
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          muscleGroups: formData.muscleGroups,
          equipment: formData.equipment || undefined,
        });
        toast.success('Exercise updated successfully');
      } else {
        await exerciseService.createExercise({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          muscleGroups: formData.muscleGroups,
          equipment: formData.equipment || undefined,
        });
        toast.success('Custom exercise created successfully');
      }
      setShowModal(false);
      loadExercises();
    } catch (error) {
      console.error('Failed to save exercise:', error);
      toast.error('Failed to save exercise');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.exerciseId) return;

    try {
      await exerciseService.deleteExercise(deleteConfirm.exerciseId);
      setExercises(exercises.filter((e) => e.id !== deleteConfirm.exerciseId));
      toast.success('Exercise deleted successfully');
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      toast.error('Failed to delete exercise');
    }
  };

  const uniqueMuscleGroups = Array.from(
    new Set(exercises.flatMap((ex) => ex.muscleGroups))
  ).sort();

  if (loading) {
    return (
      <>
        <NavBar user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Exercise Library</h1>
            <p className="text-slate-400">
              Browse exercises or create your own custom exercises
            </p>
          </div>
          <button
            onClick={handleCreateExercise}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Exercise
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                className="input-dark pl-10"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-dark"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
            </select>
            <select
              className="select-dark"
              value={muscleGroupFilter}
              onChange={(e) => setMuscleGroupFilter(e.target.value)}
            >
              <option value="">All Muscle Groups</option>
              {uniqueMuscleGroups.map((mg) => (
                <option key={mg} value={mg}>
                  {mg}
                </option>
              ))}
            </select>
          </div>
          {(searchTerm || categoryFilter || muscleGroupFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setMuscleGroupFilter('');
              }}
              className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400">No exercises found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="card-hover p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {exercise.name}
                  </h3>
                  {exercise.isCustom && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExercise(exercise)}
                        className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                          })
                        }
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {exercise.description && (
                  <p className="text-sm text-slate-400 mb-2">{exercise.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-cyan-950/50 text-cyan-300 text-xs font-medium rounded">
                    {exercise.category}
                  </span>
                  {exercise.isCustom && (
                    <span className="inline-block px-2 py-1 bg-violet-950/50 text-violet-300 text-xs font-medium rounded">
                      Custom
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-400">Muscle Groups:</span> {exercise.muscleGroups.join(', ')}
                </div>
                {exercise.equipment && (
                  <div className="text-sm text-slate-300 mt-1">
                    <span className="font-semibold text-slate-400">Equipment:</span> {exercise.equipment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Exercise Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExercise ? 'Edit Exercise' : 'Create Custom Exercise'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label-dark">
              Exercise Name *
            </label>
            <input
              type="text"
              className="input-dark"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Dumbbell Shoulder Press"
            />
          </div>

          <div>
            <label className="label-dark">
              Description
            </label>
            <textarea
              className="input-dark"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the exercise..."
              rows={3}
            />
          </div>

          <div>
            <label className="label-dark">
              Category *
            </label>
            <select
              className="select-dark"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'strength' | 'cardio' | 'flexibility',
                })
              }
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
            </select>
          </div>

          <div>
            <label className="label-dark">
              Muscle Groups *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input-dark"
                value={muscleGroupInput}
                onChange={(e) => setMuscleGroupInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMuscleGroup();
                  }
                }}
                placeholder="e.g., Shoulders, Triceps"
              />
              <button
                onClick={handleAddMuscleGroup}
                className="btn-primary flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.muscleGroups.map((mg) => (
                  <span
                    key={mg}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-950/50 text-cyan-300 text-sm font-medium rounded"
                  >
                    {mg}
                    <button
                      onClick={() => handleRemoveMuscleGroup(mg)}
                      className="text-cyan-400 hover:text-cyan-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label-dark">
              Equipment
            </label>
            <input
              type="text"
              className="input-dark"
              value={formData.equipment}
              onChange={(e) =>
                setFormData({ ...formData, equipment: e.target.value })
              }
              placeholder="e.g., Dumbbells, Barbell, Bodyweight"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              {editingExercise ? 'Update Exercise' : 'Create Exercise'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, exerciseId: null, exerciseName: '' })
        }
        onConfirm={handleDelete}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${deleteConfirm.exerciseName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-rose-600 hover:bg-rose-500"
      />
    </>
  );
}
