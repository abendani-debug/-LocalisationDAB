import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[400px] p-8 shadow-sm border border-slate-100">
        <h1 className="m-0 mb-6 text-2xl font-bold text-gray-900 text-center">Créer un compte</h1>
        <RegisterForm onSuccess={() => navigate('/login')} />
        <p className="text-center mt-4 text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
