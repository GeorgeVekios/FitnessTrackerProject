import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log-workout" element={<LogWorkout />} />
        <Route path="/edit-workout/:id" element={<LogWorkout />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
