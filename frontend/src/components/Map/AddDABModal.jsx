import { useState, useEffect } from 'react';
import { proposerDAB } from '../../api/dabApi';
import api from '../../api/axiosConfig';

const TYPES = [
  { val: 'atm',    icon: '🏧', label: 'Distributeur (ATM)' },
  { val: 'agence', icon: '🏦', label: 'Agence bancaire'    },
];

export default function AddDABModal({ position, onClose, onSuccess }) {
  const [banques, setBanques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ type_lieu: 'atm', nom: '', adresse: '', banque_id: '' });

  useEffect(() => {
    api.get('/banques').then((r) => setBanques(r.data.data || [])).catch(() => {});
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await proposerDAB({
        nom: form.nom.trim(),
        adresse: form.adresse.trim() || undefined,
        latitude: position.lat,
        longitude: position.lng,
        type_lieu: form.type_lieu,
        banque_id: form.banque_id ? parseInt(form.banque_id, 10) : undefined,
      });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la soumission.';
      const details = err.response?.data?.errors;
      setError(details?.length ? details.map((e) => e.message).join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1';

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl w-full max-w-[440px] shadow-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-base font-bold text-gray-900">Proposer un lieu</h2>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Coordonnées */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700">
          <span>📍</span>
          <span>Lat {position.lat.toFixed(5)}, Lng {position.lng.toFixed(5)}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div>
            <span className={labelClass}>Type *</span>
            <div className="flex gap-2">
              {TYPES.map(({ val, icon, label }) => (
                <label
                  key={val}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border-2 text-xs font-medium transition-colors ${
                    form.type_lieu === val
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-gray-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type_lieu"
                    value={val}
                    checked={form.type_lieu === val}
                    onChange={() => set('type_lieu', val)}
                    className="sr-only"
                  />
                  {icon} {label}
                </label>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className={labelClass}>Nom *</label>
            <input
              type="text"
              placeholder={form.type_lieu === 'agence' ? 'Ex : BNA — Agence Bab Ezzouar' : 'Ex : ATM CPA — Rue Didouche Mourad'}
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              maxLength={255}
              required
              className={inputClass}
            />
          </div>

          {/* Banque */}
          <div>
            <label className={labelClass}>Banque (optionnel)</label>
            <select value={form.banque_id} onChange={(e) => set('banque_id', e.target.value)} className={inputClass}>
              <option value="">— Sélectionner une banque —</option>
              {banques.map((b) => (
                <option key={b.id} value={b.id}>{b.nom}</option>
              ))}
            </select>
          </div>

          {/* Adresse */}
          <div>
            <label className={labelClass}>Adresse (optionnel)</label>
            <input
              type="text"
              placeholder="Ex : 12 rue des frères Bouchama, Alger"
              value={form.adresse}
              onChange={(e) => set('adresse', e.target.value)}
              maxLength={500}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? 'Envoi…' : 'Soumettre la proposition'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Votre proposition sera examinée par un administrateur avant publication.
        </p>
      </div>
    </div>
  );
}
