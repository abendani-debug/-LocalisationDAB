import { etatColor, statutLabel, etatLabel, formatDistance } from '../../utils/formatUtils';

const DOT_COLOR  = { green: '#16a34a', orange: '#ea580c', red: '#dc2626' };
const ETAT_SOLID = {
  disponible: { bg: '#16a34a', text: '#fff' },
  vide:       { bg: '#ea580c', text: '#fff' },
  en_panne:   { bg: '#dc2626', text: '#fff' },
};

export default function DABCard({ dab, onSelect, onHighlight }) {
  const color = etatColor(dab);

  return (
    <div
      onClick={() => { onHighlight?.(dab.id); onSelect?.(dab.id); }}
      style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '0.5rem', padding: '0.75rem 1rem',
        cursor: 'pointer', transition: 'box-shadow .15s',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        background: DOT_COLOR[color], flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {dab.nom}
        </p>
        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
          {statutLabel(dab.statut)}
          {dab.banque_nom && ` · ${dab.banque_nom}`}
        </p>
        {(dab.etat_communautaire || dab.vote_dominant) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            marginTop: '0.25rem',
            padding: '0.15rem 0.55rem',
            borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
            background: ETAT_SOLID[dab.etat_communautaire || dab.vote_dominant]?.bg,
            color: '#fff',
            opacity: dab.etat_communautaire ? 1 : 0.75,
          }}>
            👥 {etatLabel(dab.etat_communautaire || dab.vote_dominant)}
          </span>
        )}
      </div>
      {dab.distance_km != null && (
        <span style={{ fontSize: '0.78rem', color: '#9ca3af', flexShrink: 0 }}>
          {formatDistance(dab.distance_km)}
        </span>
      )}
    </div>
  );
}
