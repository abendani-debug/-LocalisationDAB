import { etatColor, statutLabel, etatLabel, formatDistance } from '../../utils/formatUtils';

const BADGE = {
  green:  'bg-green-100 text-green-700',
  orange: 'bg-amber-100 text-amber-700',
  red:    'bg-red-100   text-red-700',
};

const ETAT_BADGE = {
  disponible: 'bg-green-100 text-green-700',
  vide:       'bg-amber-100 text-amber-700',
  en_panne:   'bg-red-100   text-red-700',
};

export default function DABCard({ dab, onSelect, onHighlight }) {
  const color = etatColor(dab);

  return (
    <div
      onClick={() => onHighlight?.(dab.id)}
      className="bg-white border border-slate-100 rounded-xl p-3.5 cursor-pointer transition-all hover:border-blue-200 hover:shadow-sm flex flex-col gap-2"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
          🏧
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 font-semibold text-sm text-gray-900 truncate">{dab.nom}</p>
          {dab.adresse && (
            <p className="m-0 mt-0.5 text-xs text-slate-400 truncate">{dab.adresse}</p>
          )}
        </div>
        {dab.distance_km != null && (
          <span className="text-xs font-medium text-slate-400 flex-shrink-0">
            {formatDistance(dab.distance_km)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${BADGE[color] || 'bg-gray-100 text-gray-500'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {statutLabel(dab.statut)}
        </span>

        {dab.banque_nom && (
          <span className="text-[10px] text-slate-500">{dab.banque_nom}</span>
        )}

        {(dab.etat_communautaire || dab.vote_dominant) && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${ETAT_BADGE[dab.etat_communautaire || dab.vote_dominant] || 'bg-gray-100 text-gray-500'}`}
            style={{ opacity: dab.etat_communautaire ? 1 : 0.75 }}>
            👥 {etatLabel(dab.etat_communautaire || dab.vote_dominant)}
          </span>
        )}
      </div>
    </div>
  );
}
