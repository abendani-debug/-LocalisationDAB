import { useState } from 'react';
import { submitSignalement } from '../../api/signalementApi';
import toast from 'react-hot-toast';

const ETATS = [
  { key: 'disponible', label: 'Argent dispo', color: '#16a34a', bg: '#dcfce7' },
  { key: 'vide',       label: 'DAB vide',     color: '#ea580c', bg: '#ffedd5' },
  { key: 'en_panne',   label: 'En panne',     color: '#dc2626', bg: '#fee2e2' },
];

export default function SignalementButton({ dabId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSignal = async (etat) => {
    setLoading(true);
    try {
      const res = await submitSignalement(dabId, etat);
      toast.success('Signalement enregistré !');
      onSuccess?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du signalement.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
        Signalez l'état actuel (anonyme) :
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ETATS.map(({ key, label, color, bg }) => (
          <button
            key={key}
            disabled={loading}
            onClick={() => handleSignal(key)}
            style={{
              padding: '0.6rem 1rem', border: `1px solid ${color}`,
              borderRadius: '2rem', background: bg, color,
              fontWeight: 600, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'opacity .15s',
              minHeight: '44px',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
