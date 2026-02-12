import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, type User } from '../services/auth';
import { templateService, type Template } from '../services/templates';
import NavBar from '../components/NavBar';
import ConfirmModal from '../components/ConfirmModal';

export default function Templates() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    templateId: string | null;
  }>({
    isOpen: false,
    templateId: null,
  });

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
    loadTemplates();
  }, [navigate]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.templateId) return;

    try {
      await templateService.deleteTemplate(deleteConfirm.templateId);
      setTemplates(templates.filter((t) => t.id !== deleteConfirm.templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/log-workout?template=${templateId}`);
  };

  if (loading) {
    return (
      <>
        <NavBar user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Templates</h1>
          <p className="text-gray-600">
            Create reusable workout templates for your training routine. Templates help you
            quickly start workouts with pre-defined exercises and default weights.
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">
              No templates yet. Save a workout as a template to get started!
            </p>
            <p className="text-sm text-gray-500">
              After logging a workout, click "Save as Template" to create a reusable template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <h5 className="text-xl font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h5>
                    {template.description && (
                      <p className="text-sm text-gray-600 italic">{template.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUseTemplate(template.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ isOpen: true, templateId: template.id })
                      }
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div>
                  <strong className="block text-gray-900 mb-2">Exercises:</strong>
                  <ul className="space-y-2">
                    {template.exercises.map((ex) => (
                      <li
                        key={ex.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded p-3 gap-2"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {ex.exercise.name}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({ex.exercise.muscleGroups.join(', ')})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {ex.defaultSets && `${ex.defaultSets} sets`}
                          {ex.defaultSets && ex.defaultReps && ' × '}
                          {ex.defaultReps && `${ex.defaultReps} reps`}
                          {(ex.defaultSets || ex.defaultReps) && ex.defaultWeight && ' @ '}
                          {ex.defaultWeight && `${ex.defaultWeight} lbs`}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, templateId: null })}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}
