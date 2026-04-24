import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { createAvis } from '../../api/avisApi';
import toast from 'react-hot-toast';

export default function AvisForm({ dabId, onSuccess }) {
  const { t } = useTranslation();
  const [note, setNote]           = useState(0);
  const [commentaire, setComment] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note < 1) { toast.error(t('avis.choose_rating')); return; }
    setLoading(true);
    try {
      await createAvis(dabId, { note, commentaire });
      toast.success(t('avis.published'));
      setNote(0); setComment('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || t('avis.publish_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 mb-4">
      <p className="m-0 mb-2 font-semibold text-sm text-gray-900">{t('avis.leave')}</p>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map((n) => (
          <span
            key={n}
            onClick={() => setNote(n)}
            className={`text-2xl cursor-pointer transition-colors ${n <= note ? 'text-amber-400' : 'text-slate-200'}`}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('avis.comment_placeholder')}
        maxLength={1000}
        rows={3}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white resize-vertical focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
      <button
        type="submit"
        disabled={loading || note < 1}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
      >
        {loading ? t('avis.publishing') : t('avis.publish')}
      </button>
    </form>
  );
}
