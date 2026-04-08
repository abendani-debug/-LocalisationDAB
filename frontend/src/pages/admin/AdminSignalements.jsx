import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { resoudreSignalements } from '../../api/signalementApi';
import { etatLabel, formatDate } from '../../utils/formatUtils';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const ETAT_COLORS = {
  disponible: '#065f46',
  vide:       '#92400e',
  en_panne:   '#991b1b',
};

export default function AdminSignalements() {
  const [dabs, setDabs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/signalements')
      .then((r) => setDabs(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleResoudre = async (dab) => {
    if (!window.confirm(`Résoudre les signalements de "${dab.nom}" ?`)) return;
    try {
      await resoudreSignalements(dab.id);
      toast.success('Signalements résolus.');
      load();
    } catch {
      toast.error('Erreur lors de la résolution.');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Signalements actifs</h1>

      {loading ? <Spinner /> : dabs.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Aucun signalement actif en ce moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {dabs.map((dab) => {
            const votes = dab.votes || {};
            const total = Object.values(votes).reduce((a, b) => a + b, 0);
            return (
              <div key={dab.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{dab.nom}</p>
                  {dab.adresse && (
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{dab.adresse}</p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {Object.entries(votes).map(([etat, nb]) => (
                      <span key={etat} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: ETAT_COLORS[etat] || '#374151', borderRadius: '999px', padding: '0.1rem 0.6rem' }}>
                        {etatLabel(etat)} × {nb}
                      </span>
                    ))}
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{total} vote(s) au total</span>
                  </div>
                  {dab.etat_communautaire && (
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#374151' }}>
                      État déclenché : <strong>{etatLabel(dab.etat_communautaire)}</strong>
                      {dab.etat_communautaire_at && ` · ${formatDate(dab.etat_communautaire_at)}`}
                    </p>
                  )}
                </div>
                <button onClick={() => handleResoudre(dab)} style={{ padding: '0.4rem 0.9rem', background: '#065f46', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                  Résoudre
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
