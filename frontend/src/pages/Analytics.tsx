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

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f1f5f9',
  };

  if (loading) {
    return (
      <>
        <NavBar user={user} />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Analytics & Progress</h1>

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-2">
        {(['30', '90', '365', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-cyan-600/20 text-cyan-400 shadow-glow-cyan'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700'
            }`}
          >
            {range === 'all' ? 'All Time' : `${range} Days`}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-6 border-l-4 border-l-cyan-500">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Workouts</h3>
            <p className="text-3xl font-bold text-cyan-400">{summary.totalWorkouts}</p>
          </div>
          <div className="card p-6 border-l-4 border-l-emerald-500">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Exercises Trained</h3>
            <p className="text-3xl font-bold text-emerald-400">{summary.uniqueExercises}</p>
          </div>
          <div className="card p-6 border-l-4 border-l-amber-500">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Current Streak</h3>
            <p className="text-3xl font-bold text-amber-400">{summary.currentStreak} days</p>
          </div>
          <div className="card p-6 border-l-4 border-l-violet-500">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Last Workout</h3>
            {summary.lastWorkout ? (
              <>
                <p className="text-lg font-semibold text-slate-100">{summary.lastWorkout.name}</p>
                <p className="text-sm text-slate-400">
                  {new Date(summary.lastWorkout.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No workouts yet</p>
            )}
          </div>
        </div>
      )}

      {/* Workout Frequency Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Workout Frequency (by week)</h2>
        {frequencyData.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No workout data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="week"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip
                labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Bar dataKey="count" fill="#06b6d4" name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume Over Time Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Total Volume Over Time</h2>
        {volumeData.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No volume data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(0)} lbs`, 'Volume']}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} name="Volume (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exercise Progress Chart */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-100">Exercise Progress</h2>
          <select
            className="select-dark"
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
            <div className="spinner"></div>
          </div>
        ) : progressData.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No progress data for this exercise</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} lbs`, '']}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Line type="monotone" dataKey="maxWeight" stroke="#8b5cf6" strokeWidth={2} name="Max Weight (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Personal Records Table */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Personal Records</h2>
        {personalRecords.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No personal records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Exercise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Reps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {personalRecords.map((pr) => (
                  <tr key={pr.exerciseId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                      {pr.exerciseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {pr.maxWeight.toFixed(1)} lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {pr.reps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
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
