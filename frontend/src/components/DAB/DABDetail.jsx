import { etatColor, statutLabel, etatLabel, formatDate } from '../../utils/formatUtils';
import SignalementBadge from '../Signalement/SignalementBadge';
import SignalementButton from '../Signalement/SignalementButton';
import AvisList from '../Avis/AvisList';
import AvisForm from '../Avis/AvisForm';
import useAuth from '../../hooks/useAuth';

const DOT_CLASS = {
  green:  'bg-green-500',
  orange: 'bg-amber-500',
  red:    'bg-red-500',
  gray:   'bg-gray-400',
};

export default function DABDetail({ dab, onSignalement }) {
  const { isAuthenticated } = useAuth();
  const color = etatColor(dab);

  return (
    <div className="max-w-[680px] mx-auto p-4">
      {/* En-tête */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ${DOT_CLASS[color] ?? 'bg-gray-400'}`} />
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-bold text-gray-900 leading-snug">{dab.nom}</h1>
          {dab.adresse && (
            <p className="mt-0.5 text-sm text-slate-500">{dab.adresse}</p>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 flex flex-wrap gap-4">
        <Info label="Statut admin"  value={statutLabel(dab.statut)} />
        <Info label="État signalé"  value={dab.etat_communautaire ? etatLabel(dab.etat_communautaire) : '—'} />
        {dab.banque_nom && <Info label="Banque" value={dab.banque_nom} />}
        {dab.etat_communautaire_at && <Info label="Mis à jour" value={formatDate(dab.etat_communautaire_at)} />}
        {dab.services?.length > 0 && (
          <Info label="Services" value={dab.services.map((s) => s.nom).join(', ')} />
        )}
      </div>

      {/* Signalement communautaire */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          État communautaire
        </h2>
        <SignalementBadge dabId={dab.id} currentEtat={dab.etat_communautaire} />
        <div className="mt-3">
          <SignalementButton dabId={dab.id} onSuccess={onSignalement} />
        </div>
      </section>

      {/* Avis */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Avis utilisateurs
        </h2>
        {isAuthenticated && <AvisForm dabId={dab.id} onSuccess={() => {}} />}
        <AvisList dabId={dab.id} />
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="m-0 text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}
