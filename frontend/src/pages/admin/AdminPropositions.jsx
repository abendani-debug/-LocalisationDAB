import { useState, useEffect } from 'react';
import { getPropositions, approuverProposition, rejeterProposition } from '../../api/dabApi';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const TYPE_LABEL = { atm: '🏧 Distributeur', agence: '🏦 Agence bancaire' };

export default function AdminPropositions() {
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busy, setBusy]                 = useState(null); // id en cours de traitement

  const load = () => {
    setLoading(true);
    getPropositions()
      .then((r) => setPropositions(r.data || []))
      .catch(() => toast.error('Erreur lors du chargement.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprouver = async (id, nom) => {
    if (!window.confirm(`Approuver "${nom}" et la rendre visible sur la carte ?`)) return;
    setBusy(id);
    try {
      await approuverProposition(id);
      toast.success(`"${nom}" approuvée et publiée.`);
      load();
    } catch {
      toast.error('Erreur lors de l\'approbation.');
    } finally {
      setBusy(null);
    }
  };

  const handleRejeter = async (id, nom) => {
    if (!window.confirm(`Rejeter et supprimer définitivement "${nom}" ?`)) return;
    setBusy(id);
    try {
      await rejeterProposition(id);
      toast.success(`"${nom}" rejetée.`);
      load();
    } catch {
      toast.error('Erreur lors du rejet.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Propositions communautaires</h1>
        <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
          {propositions.length} en attente
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner /></div>
      ) : propositions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '0.95rem' }}>
          Aucune proposition en attente.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {propositions.map((p) => (
            <div key={p.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem',
              padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.nom}</span>
                  <span style={{
                    padding: '1px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                    background: p.type_lieu === 'agence' ? '#dbeafe' : '#fef9c3',
                    color:      p.type_lieu === 'agence' ? '#1d4ed8' : '#854d0e',
                  }}>
                    {TYPE_LABEL[p.type_lieu] || p.type_lieu}
                  </span>
                </div>

                {p.banque_nom && (
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                    🏛 {p.banque_nom}
                  </div>
                )}
                {p.adresse && (
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                    📍 {p.adresse}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Coordonnées : {parseFloat(p.latitude).toFixed(5)}, {parseFloat(p.longitude).toFixed(5)}
                  {' · '}
                  Soumis le {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <a
                  href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '0.4rem 0.75rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}
                >
                  Voir carte
                </a>
                <button
                  onClick={() => handleApprouver(p.id, p.nom)}
                  disabled={busy === p.id}
                  style={{ padding: '0.4rem 0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, opacity: busy === p.id ? 0.6 : 1 }}
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleRejeter(p.id, p.nom)}
                  disabled={busy === p.id}
                  style={{ padding: '0.4rem 0.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, opacity: busy === p.id ? 0.6 : 1 }}
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
