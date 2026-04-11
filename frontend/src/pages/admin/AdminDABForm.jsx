import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDAB, createDAB, updateDAB } from '../../api/dabApi';
import api from '../../api/axiosConfig';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const FIELDS = [
  ['nom',       'Nom *',        'text'],
  ['adresse',   'Adresse',      'text'],
  ['latitude',  'Latitude *',   'number'],
  ['longitude', 'Longitude *',  'number'],
];

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

  if (loading) return <div className="py-16 flex justify-center"><Spinner /></div>;

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors';
  const labelClass = 'block mb-1 text-sm font-medium text-gray-700';

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Modifier le DAB' : 'Nouveau DAB'}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {FIELDS.map(([key, label, type]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              required={label.includes('*')}
              step="any"
              className={inputClass}
            />
          </div>
        ))}

        <div>
          <label className={labelClass}>Statut</label>
          <select value={form.statut} onChange={(e) => handleChange('statut', e.target.value)} className={inputClass}>
            <option value="actif">Actif</option>
            <option value="hors_service">Hors service</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Banque</label>
          <select value={form.banque_id} onChange={(e) => handleChange('banque_id', e.target.value)} className={inputClass}>
            <option value="">Aucune</option>
            {banques.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </select>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/dabs')}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
