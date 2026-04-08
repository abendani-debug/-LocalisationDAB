import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDAB, createDAB, updateDAB } from '../../api/dabApi';
import api from '../../api/axiosConfig';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', boxSizing: 'border-box' };

export default function AdminDABForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [banques, setBanques] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    nom: '', adresse: '', latitude: '', longitude: '', statut: 'actif', banque_id: '',
  });

  useEffect(() => {
    api.get('/banques').then((r) => setBanques(r.data.data || [])).catch(() => {});
    if (isEdit) {
      getDAB(id)
        .then((r) => {
          const d = r.data;
          setForm({ nom: d.nom || '', adresse: d.adresse || '', latitude: d.latitude || '', longitude: d.longitude || '', statut: d.statut || 'actif', banque_id: d.banque_id || '' });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) { await updateDAB(id, form); toast.success('DAB mis à jour.'); }
      else        { await createDAB(form);      toast.success('DAB créé.'); }
      navigate('/admin/dabs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>{isEdit ? 'Modifier le DAB' : 'Nouveau DAB'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[['nom', 'Nom *', 'text'], ['adresse', 'Adresse', 'text'], ['latitude', 'Latitude *', 'number'], ['longitude', 'Longitude *', 'number']].map(([key, label, type]) => (
          <div key={key}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>
            <input type={type} value={form[key]} onChange={(e) => handleChange(key, e.target.value)} required={label.includes('*')} step="any" style={inputStyle} />
          </div>
        ))}

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Statut</label>
          <select value={form.statut} onChange={(e) => handleChange('statut', e.target.value)} style={inputStyle}>
            <option value="actif">Actif</option>
            <option value="hors_service">Hors service</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Banque</label>
          <select value={form.banque_id} onChange={(e) => handleChange('banque_id', e.target.value)} style={inputStyle}>
            <option value="">Aucune</option>
            {banques.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => navigate('/admin/dabs')} style={{ flex: 1, padding: '0.6rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
            Annuler
          </button>
          <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.6rem', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
