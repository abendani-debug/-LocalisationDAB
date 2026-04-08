import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', textAlign: 'center' }}>Connexion</h1>
        <LoginForm onSuccess={() => navigate('/')} />
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#1e40af' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
