import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { authService, type User } from '../services/auth';
import { analyticsService, type PersonalRecord, type SummaryStats } from '../services/analytics';
import { exerciseService, type Exercise } from '../services/exercises';
import NavBar from '../components/NavBar';

export default function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Summary stats
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  // Charts data
  const [frequencyData, setFrequencyData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);

  // Exercise selection for progress chart
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  // Date filters
  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>('90');

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
    loadData();
    loadExercises();
  }, [navigate]);

  useEffect(() => {
    loadFrequencyAndVolume();
  }, [dateRange]);

  useEffect(() => {
    if (selectedExercise) {
      loadProgressData();
    }
  }, [selectedExercise, dateRange]);

  const getDateRange = () => {
    if (dateRange === 'all') return { startDate: undefined, endDate: undefined };

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, prs] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getPersonalRecords(),
      ]);

      setSummary(summaryData);
      setPersonalRecords(prs);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getExercises();
      setExercises(data);
      if (data.length > 0) {
        setSelectedExercise(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const loadFrequencyAndVolume = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      const [frequency, volume] = await Promise.all([
        analyticsService.getWorkoutFrequency(startDate, endDate),
        analyticsService.getVolume(startDate, endDate),
      ]);

      setFrequencyData(frequency);
      setVolumeData(volume);
    } catch (error) {
      console.error('Failed to load frequency/volume:', error);
    }
  };

  const loadProgressData = async () => {
    if (!selectedExercise) return;

    setProgressLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await analyticsService.getExerciseProgress(
        selectedExercise,
        startDate,
        endDate
      );
      setProgressData(data);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setProgressLoading(false);
    }
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Progress</h1>

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-2">
        {(['30', '90', '365', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range === 'all' ? 'All Time' : `${range} Days`}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Workouts</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.totalWorkouts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Exercises Trained</h3>
            <p className="text-3xl font-bold text-green-600">{summary.uniqueExercises}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Streak</h3>
            <p className="text-3xl font-bold text-orange-600">{summary.currentStreak} days</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Last Workout</h3>
            {summary.lastWorkout ? (
              <>
                <p className="text-lg font-semibold text-gray-900">{summary.lastWorkout.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(summary.lastWorkout.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No workouts yet</p>
            )}
          </div>
        </div>
      )}

      {/* Workout Frequency Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout Frequency (by week)</h2>
        {frequencyData.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No workout data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume Over Time Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Volume Over Time</h2>
        {volumeData.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No volume data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value.toFixed(0)} lbs`, 'Volume']}
              />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} name="Volume (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exercise Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Exercise Progress</h2>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
        {progressLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : progressData.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No progress data for this exercise</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value.toFixed(1)} lbs`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="maxWeight" stroke="#8b5cf6" strokeWidth={2} name="Max Weight (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Personal Records Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Records</h2>
        {personalRecords.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No personal records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exercise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personalRecords.map((pr) => (
                  <tr key={pr.exerciseId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pr.exerciseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pr.maxWeight.toFixed(1)} lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pr.reps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pr.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
