import { useState, useEffect } from 'react';
import { proposerDAB } from '../../api/dabApi';
import api from '../../api/axiosConfig';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 2000, padding: '1rem',
};

const modal = {
  background: '#fff', borderRadius: '0.75rem', padding: '1.5rem',
  width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  fontFamily: 'system-ui, sans-serif',
};

const label = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' };

const input = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
  border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box',
  outline: 'none',
};

const btnPrimary = {
  padding: '0.6rem 1.2rem', background: '#1e40af', color: '#fff',
  border: 'none', borderRadius: '0.375rem', fontWeight: 600,
  fontSize: '0.9rem', cursor: 'pointer',
};

const btnSecondary = {
  padding: '0.6rem 1.2rem', background: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: 600,
  fontSize: '0.9rem', cursor: 'pointer',
};

export default function AddDABModal({ position, onClose, onSuccess }) {
  const [banques, setBanques]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({
    type_lieu: 'atm',
    nom: '',
    adresse: '',
    banque_id: '',
  });

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

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Proposer un lieu</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>✕</button>
        </div>

        {/* Coordonnées (lecture seule) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#f0f9ff', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#0369a1' }}>
          <span>📍</span>
          <span>Lat {position.lat.toFixed(5)}, Lng {position.lng.toFixed(5)}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={label}>Type *</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[{ val: 'atm', icon: '🏧', label: 'Distributeur (ATM)' }, { val: 'agence', icon: '🏦', label: 'Agence bancaire' }].map(({ val, icon, label: lbl }) => (
                <label key={val} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer',
                  border: `2px solid ${form.type_lieu === val ? '#1e40af' : '#d1d5db'}`,
                  background: form.type_lieu === val ? '#eff6ff' : '#fff',
                  fontSize: '0.82rem', fontWeight: form.type_lieu === val ? 700 : 400,
                }}>
                  <input type="radio" name="type_lieu" value={val} checked={form.type_lieu === val} onChange={() => set('type_lieu', val)} style={{ margin: 0 }} />
                  {icon} {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Nom *</label>
            <input
              style={input}
              type="text"
              placeholder={form.type_lieu === 'agence' ? 'Ex : BNA — Agence Bab Ezzouar' : 'Ex : ATM CPA — Rue Didouche Mourad'}
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              maxLength={255}
              required
            />
          </div>

          {/* Banque */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Banque (optionnel)</label>
            <select style={input} value={form.banque_id} onChange={(e) => set('banque_id', e.target.value)}>
              <option value="">— Sélectionner une banque —</option>
              {banques.map((b) => (
                <option key={b.id} value={b.id}>{b.nom}</option>
              ))}
            </select>
          </div>

          {/* Adresse */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={label}>Adresse (optionnel)</label>
            <input
              style={input}
              type="text"
              placeholder="Ex : 12 rue des frères Bouchama, Alger"
              value={form.adresse}
              onChange={(e) => set('adresse', e.target.value)}
              maxLength={500}
            />
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.6rem 0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.375rem', fontSize: '0.82rem', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" style={btnSecondary} onClick={onClose}>Annuler</button>
            <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Envoi…' : 'Soumettre la proposition'}
            </button>
          </div>
        </form>

        <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          Votre proposition sera examinée par un administrateur avant publication.
        </p>
      </div>
    </div>
  );
}
