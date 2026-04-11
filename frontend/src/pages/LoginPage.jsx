import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[400px] p-8 shadow-sm border border-slate-100">
        <h1 className="m-0 mb-6 text-2xl font-bold text-gray-900 text-center">Connexion</h1>
        <LoginForm onSuccess={() => navigate('/')} />
        <p className="text-center mt-4 text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
