import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import Exercises from './pages/Exercises';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log-workout" element={<LogWorkout />} />
        <Route path="/edit-workout/:id" element={<LogWorkout />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
