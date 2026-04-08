import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleImportGoogle = async () => {
    setImporting(true);
    try {
      const res = await api.post('/admin/import-google');
      const d = res.data.data;
      toast.success(`Import Google Places : ${d.inserted} ajoutés, ${d.updated} mis à jour.`);
    } catch {
      toast.error('Erreur lors de l\'import Google Places.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>;

  const totalDABs      = stats?.dabs?.reduce((s, r) => s + r.total, 0) || 0;
  const nbPropositions = stats?.propositions?.total || 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Administration</h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="DAB total" value={totalDABs} />
        <StatCard label="Utilisateurs" value={stats?.users?.total || 0} />
        <StatCard label="Signalements actifs" value={stats?.signalements?.total || 0} />
        <StatCard label="Propositions en attente" value={nbPropositions} highlight={nbPropositions > 0} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link to="/admin/dabs" style={linkBtn}>Gérer les DAB</Link>
        <Link to="/admin/signalements" style={linkBtn}>Signalements</Link>
        <Link to="/admin/propositions" style={{ ...linkBtn, background: nbPropositions > 0 ? '#b45309' : '#374151', position: 'relative' }}>
          Propositions{nbPropositions > 0 && <span style={{ marginLeft: '0.4rem', background: '#fbbf24', color: '#78350f', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 700 }}>{nbPropositions}</span>}
        </Link>
        <button onClick={handleImportGoogle} disabled={importing} style={{ ...linkBtn, background: '#065f46', cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.7 : 1 }}>
          {importing ? 'Import en cours…' : 'Import Google Places'}
        </button>
      </div>

      <div>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Répartition par statut</h2>
        {stats?.dabs?.map((row) => (
          <div key={row.statut} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
            <span>{row.statut}</span>
            <strong>{row.total}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

const linkBtn = {
  padding: '0.6rem 1.2rem', background: '#1e40af', color: '#fff',
  borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600,
  fontSize: '0.9rem', border: 'none',
};

function StatCard({ label, value, highlight = false }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${highlight ? '#fbbf24' : '#e5e7eb'}`, borderRadius: '0.5rem', padding: '1rem 1.5rem', minWidth: '140px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: highlight ? '#b45309' : '#1e40af' }}>{value}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>{label}</p>
    </div>
  );
}
