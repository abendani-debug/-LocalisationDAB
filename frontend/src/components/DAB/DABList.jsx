import DABCard from './DABCard';
import Spinner from '../UI/Spinner';
import ErrorMessage from '../UI/ErrorMessage';

export default function DABList({ dabs, loading, error, onRetry, onSelectDAB, onHighlightDAB }) {
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;
  if (error)   return <div style={{ padding: '1rem' }}><ErrorMessage message={error} onRetry={onRetry} /></div>;
  if (!dabs.length) return (
    <p style={{ padding: '1rem', color: '#6b7280', textAlign: 'center', fontSize: '0.9rem' }}>
      Aucun DAB trouvé dans cette zone.
    </p>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
      {dabs.map((dab) => <DABCard key={dab.id} dab={dab} onSelect={onSelectDAB} onHighlight={onHighlightDAB} />)}
    </div>
  );
}
