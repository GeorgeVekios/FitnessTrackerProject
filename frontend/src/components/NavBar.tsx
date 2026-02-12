import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Dumbbell, ClipboardList, BarChart3, Menu, X, LogOut } from 'lucide-react';
import { authService } from '../services/auth';

interface NavBarProps {
  user?: {
    name: string;
    profilePictureUrl?: string;
  } | null;
}

export default function NavBar({ user }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/log-workout', label: 'Log Workout', icon: Plus },
    { path: '/exercises', label: 'Exercises', icon: Dumbbell },
    { path: '/templates', label: 'Templates', icon: ClipboardList },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center cursor-pointer group"
          >
            <Dumbbell className="w-6 h-6 text-cyan-500 mr-2 group-hover:text-cyan-400 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              FitTracker
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-cyan-600/20 text-cyan-400 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user?.profilePictureUrl && (
              <img
                src={user.profilePictureUrl}
                alt={user.name}
                className="rounded-full w-9 h-9 ring-2 ring-slate-700"
              />
            )}
            <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-cyan-600/20 text-cyan-400'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}

              {/* Mobile User Info */}
              <div className="pt-3 border-t border-slate-800 mt-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  {user?.profilePictureUrl && (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="rounded-full w-9 h-9 ring-2 ring-slate-700"
                    />
                  )}
                  <span className="text-slate-300 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-1 flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-all duration-200 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
