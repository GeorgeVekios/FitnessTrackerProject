import { authService } from '../services/auth';

export default function Login() {
  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Fitness Tracker</h1>
      <p>Track your workouts and progress</p>
      <button
        onClick={handleGoogleLogin}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
