import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login as loginApi } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: '0.375rem', fontSize: '0.9rem', boxSizing: 'border-box',
};
const errorStyle = { color: '#dc2626', fontSize: '0.78rem', marginTop: '0.25rem' };

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      login(res.data.token, res.data.user);
      toast.success('Connexion réussie !');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants invalides.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
        <input type="email" {...register('email')} style={inputStyle} />
        {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Mot de passe</label>
        <input type="password" {...register('password')} style={inputStyle} />
        {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} style={{
        padding: '0.6rem', background: '#1e40af', color: '#fff',
        border: 'none', borderRadius: '0.375rem', fontWeight: 600,
        cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
      }}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
