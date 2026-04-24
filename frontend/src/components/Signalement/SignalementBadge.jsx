import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSignalements } from '../../api/signalementApi';

export default function SignalementBadge({ dabId, currentEtat }) {
  const { t } = useTranslation();
  const [votes, setVotes] = useState({ disponible: 0, vide: 0, en_panne: 0 });
  const [total, setTotal] = useState(0);

  const CONFIG = {
    disponible: { label: t('signalement.money_available'), icon: '✅', badge: 'bg-green-100 text-green-700 border-green-200' },
    vide:       { label: t('signalement.dab_empty'),       icon: '🟠', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    en_panne:   { label: t('signalement.broken'),          icon: '❌', badge: 'bg-red-100   text-red-700   border-red-200'   },
  };

  useEffect(() => {
    getSignalements(dabId)
      .then((res) => {
        setVotes(res.data?.votes || { disponible: 0, vide: 0, en_panne: 0 });
        setTotal(res.data?.totalVotes || 0);
      })
      .catch(() => {});
  }, [dabId]);

  if (!currentEtat && total === 0) {
    return <p className="text-sm text-slate-400">{t('signalement.no_recent')}</p>;
  }

  const cfg = currentEtat && CONFIG[currentEtat];

  return (
    <div>
      {cfg && (
        <div className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-sm font-semibold mb-2 ${cfg.badge}`}>
          {cfg.icon} {cfg.label}
        </div>
      )}
      {total > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(votes).map(([etat, count]) => count > 0 && (
            <span key={etat} className="text-xs text-slate-500">
              {CONFIG[etat]?.icon} {count} vote{count > 1 ? 's' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
