import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService, type Template } from '../services/templates';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      alert('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateService.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/log-workout?template=${templateId}`);
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
        <h1 className="text-3xl font-bold text-gray-900">Workout Templates</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="mb-6">
        <p className="text-gray-600">
          Create reusable workout templates for your training routine. Templates help you quickly start workouts with pre-defined exercises and default weights.
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h5>
                  {template.description && (
                    <p className="text-sm text-gray-600 italic">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div>
                <strong className="block text-gray-900 mb-2">Exercises:</strong>
                <ul className="space-y-2">
                  {template.exercises.map((ex) => (
                    <li key={ex.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
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
  );
}
