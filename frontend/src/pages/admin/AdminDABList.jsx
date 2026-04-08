import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDABs, deleteDAB } from '../../api/dabApi';
import { statutLabel, etatLabel } from '../../utils/formatUtils';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

export default function AdminDABList() {
  const [dabs, setDabs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);

  const load = () => {
    setLoading(true);
    getDABs({ page, limit: 30 })
      .then((r) => setDabs(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" ?`)) return;
    try {
      await deleteDAB(id);
      toast.success('DAB supprimé.');
      load();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>DAB</h1>
        <Link to="/admin/dabs/new" style={{ padding: '0.5rem 1rem', background: '#1e40af', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          + Nouveau DAB
        </Link>
      </div>

      {loading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Nom', 'Banque', 'Statut', 'État signalé', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dabs.map((dab) => (
              <tr key={dab.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{dab.nom}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280' }}>{dab.banque_nom || '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{statutLabel(dab.statut)}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{dab.etat_communautaire ? etatLabel(dab.etat_communautaire) : '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/admin/dabs/${dab.id}/edit`} style={{ color: '#3b82f6', fontSize: '0.8rem' }}>Modifier</Link>
                  <button onClick={() => handleDelete(dab.id, dab.nom)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>←</button>
        <span style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={dabs.length < 30} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>→</button>
      </div>
    </div>
  );
}
