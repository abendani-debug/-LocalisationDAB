import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDABs, deleteDAB } from '../../api/dabApi';
import { statutLabel, etatLabel } from '../../utils/formatUtils';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

export default function AdminDABList() {
  const [dabs, setDabs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0 text-2xl font-bold text-gray-900">DAB</h1>
        <Link to="/admin/dabs/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
          + Nouveau DAB
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Nom', 'Banque', 'Statut', 'État signalé', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dabs.map((dab, i) => (
                <tr key={dab.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === dabs.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{dab.nom}</td>
                  <td className="px-4 py-3 text-slate-500">{dab.banque_nom || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{statutLabel(dab.statut)}</td>
                  <td className="px-4 py-3 text-gray-700">{dab.etat_communautaire ? etatLabel(dab.etat_communautaire) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link to={`/admin/dabs/${dab.id}/edit`} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(dab.id, dab.nom)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 mt-4 justify-center items-center">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-gray-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          ←
        </button>
        <span className="px-3 py-1.5 text-sm text-slate-500">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={dabs.length < 30}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-gray-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          →
        </button>
      </div>
    </div>
  );
}
