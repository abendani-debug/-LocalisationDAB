import { etatColor, statutLabel, etatLabel, formatDate } from '../../utils/formatUtils';
import SignalementBadge from '../Signalement/SignalementBadge';
import SignalementButton from '../Signalement/SignalementButton';
import AvisList from '../Avis/AvisList';
import AvisForm from '../Avis/AvisForm';
import useAuth from '../../hooks/useAuth';

const DOT_COLOR = { green: '#16a34a', orange: '#ea580c', red: '#dc2626' };

export default function DABDetail({ dab, onSignalement }) {
  const { isAuthenticated } = useAuth();
  const color = etatColor(dab);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: DOT_COLOR[color], marginTop: '0.3rem', flexShrink: 0 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{dab.nom}</h1>
          {dab.adresse && <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{dab.adresse}</p>}
        </div>
      </div>

      {/* Infos */}
      <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Info label="Statut admin"   value={statutLabel(dab.statut)} />
        <Info label="État signalé"   value={dab.etat_communautaire ? etatLabel(dab.etat_communautaire) : '—'} />
        {dab.banque_nom && <Info label="Banque" value={dab.banque_nom} />}
        {dab.etat_communautaire_at && <Info label="Mis à jour" value={formatDate(dab.etat_communautaire_at)} />}
        {dab.services?.length > 0 && (
          <Info label="Services" value={dab.services.map((s) => s.nom).join(', ')} />
        )}
      </div>

      {/* Signalement communautaire */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>État communautaire</h2>
        <SignalementBadge dabId={dab.id} currentEtat={dab.etat_communautaire} />
        <div style={{ marginTop: '0.75rem' }}>
          <SignalementButton dabId={dab.id} onSuccess={onSignalement} />
        </div>
      </section>

      {/* Avis */}
      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Avis utilisateurs</h2>
        {isAuthenticated && <AvisForm dabId={dab.id} onSuccess={() => {}} />}
        <AvisList dabId={dab.id} />
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: '0.15rem 0 0', fontSize: '0.9rem', fontWeight: 500 }}>{value}</p>
    </div>
  );
}
