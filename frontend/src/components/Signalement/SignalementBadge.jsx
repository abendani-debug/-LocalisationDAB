import { useState, useEffect } from 'react';
import { getSignalements } from '../../api/signalementApi';

const CONFIG = {
  disponible: { label: 'Argent disponible', color: '#16a34a', bg: '#dcfce7', icon: '✅' },
  vide:       { label: 'DAB vide',          color: '#ea580c', bg: '#ffedd5', icon: '🟠' },
  en_panne:   { label: 'En panne',          color: '#dc2626', bg: '#fee2e2', icon: '❌' },
};

export default function SignalementBadge({ dabId, currentEtat }) {
  const [votes, setVotes]   = useState({ disponible: 0, vide: 0, en_panne: 0 });
  const [total, setTotal]   = useState(0);

  useEffect(() => {
    getSignalements(dabId)
      .then((res) => {
        setVotes(res.data?.votes || { disponible: 0, vide: 0, en_panne: 0 });
        setTotal(res.data?.totalVotes || 0);
      })
      .catch(() => {});
  }, [dabId]);

  if (!currentEtat && total === 0) {
    return <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Aucun signalement récent.</p>;
  }

  const cfg = currentEtat && CONFIG[currentEtat];

  return (
    <div>
      {cfg && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`,
          borderRadius: '2rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: 600,
          marginBottom: '0.5rem',
        }}>
          {cfg.icon} {cfg.label}
        </div>
      )}
      {total > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(votes).map(([etat, count]) => count > 0 && (
            <span key={etat} style={{ fontSize: '0.78rem', color: '#6b7280' }}>
              {CONFIG[etat]?.icon} {count} vote{count > 1 ? 's' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
