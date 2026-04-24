import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getAvis, deleteAvis } from '../../api/avisApi';
import { formatDate, starRating } from '../../utils/formatUtils';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Spinner from '../UI/Spinner';

export default function AvisList({ dabId }) {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [data, setData]       = useState({ stats: null, avis: [] });
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
    if (!window.confirm(t('avis.confirm_delete'))) return;
    try {
      await deleteAvis(dabId, avisId);
      toast.success(t('avis.deleted'));
      load();
    } catch {
      toast.error(t('avis.delete_error'));
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (!data.avis.length) return <p className="text-sm text-slate-400">{t('avis.no_reviews')}</p>;

  return (
    <div>
      {data.stats?.total > 0 && (
        <p className="text-xs text-slate-500 mb-3">
          {data.stats.total} {t('avis.reviews_avg')} {data.stats.moyenne}/5
        </p>
      )}
      <div className="flex flex-col gap-3">
        {data.avis.map((a) => (
          <div key={a.id} className="bg-white border border-slate-100 rounded-xl px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-amber-400 tracking-wide">{starRating(a.note)}</span>
                <span className="ml-2 font-semibold text-sm text-gray-900">{a.user_nom}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatDate(a.created_at)}</span>
                {(isAdmin || user?.id === a.user_id) && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            {a.commentaire && (
              <p className="mt-2 text-sm text-gray-700">{a.commentaire}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
