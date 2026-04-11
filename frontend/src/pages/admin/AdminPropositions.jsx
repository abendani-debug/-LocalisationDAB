import { useState, useEffect } from 'react';
import { getPropositions, approuverProposition, rejeterProposition } from '../../api/dabApi';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const TYPE_BADGE = {
  atm:    { label: '🏧 Distributeur',  class: 'bg-yellow-100 text-yellow-800' },
  agence: { label: '🏦 Agence bancaire', class: 'bg-blue-100 text-blue-700'   },
};

export default function AdminPropositions() {
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busy, setBusy]                 = useState(null);

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="m-0 text-2xl font-bold text-gray-900">Propositions communautaires</h1>
        <span className="text-xs text-slate-500">{propositions.length} en attente</span>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : propositions.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">Aucune proposition en attente.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {propositions.map((p) => {
            const typeCfg = TYPE_BADGE[p.type_lieu] || { label: p.type_lieu, class: 'bg-slate-100 text-slate-600' };
            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-xl px-4 py-4 flex gap-4 items-start">
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{p.nom}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeCfg.class}`}>
                      {typeCfg.label}
                    </span>
                  </div>
                  {p.banque_nom && (
                    <p className="text-xs text-slate-500 mb-0.5">🏛 {p.banque_nom}</p>
                  )}
                  {p.adresse && (
                    <p className="text-xs text-slate-500 mb-0.5">📍 {p.adresse}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {parseFloat(p.latitude).toFixed(5)}, {parseFloat(p.longitude).toFixed(5)}
                    {' · '}
                    {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <a
                    href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Voir carte
                  </a>
                  <button
                    onClick={() => handleApprouver(p.id, p.nom)}
                    disabled={busy === p.id}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleRejeter(p.id, p.nom)}
                    disabled={busy === p.id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
