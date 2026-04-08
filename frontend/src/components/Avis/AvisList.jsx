import { useState, useEffect } from 'react';
import { getAvis, deleteAvis } from '../../api/avisApi';
import { formatDate, starRating } from '../../utils/formatUtils';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Spinner from '../UI/Spinner';

export default function AvisList({ dabId }) {
  const { user, isAdmin } = useAuth();
  const [data, setData]     = useState({ stats: null, avis: [] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAvis(dabId)
      .then((res) => setData(res.data || { stats: null, avis: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [dabId]);

  const handleDelete = async (avisId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await deleteAvis(dabId, avisId);
      toast.success('Avis supprimé.');
      load();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (!data.avis.length) return <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Aucun avis pour ce DAB.</p>;

  return (
    <div>
      {data.stats?.total > 0 && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
          {data.stats.total} avis · Moyenne : {data.stats.moyenne}/5
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.avis.map((a) => (
          <div key={a.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ color: '#f59e0b', letterSpacing: '0.05em' }}>{starRating(a.note)}</span>
                <span style={{ marginLeft: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{a.user_nom}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(a.created_at)}</span>
                {(isAdmin || user?.id === a.user_id) && (
                  <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            {a.commentaire && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#374151' }}>{a.commentaire}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
