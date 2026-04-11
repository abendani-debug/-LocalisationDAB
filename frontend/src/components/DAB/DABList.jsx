import DABCard from './DABCard';
import Spinner from '../UI/Spinner';
import ErrorMessage from '../UI/ErrorMessage';

export default function DABList({ dabs, loading, error, onRetry, onSelectDAB, onHighlightDAB }) {
  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error)   return <div className="p-4"><ErrorMessage message={error} onRetry={onRetry} /></div>;
  if (!dabs.length) return (
    <p className="p-4 text-center text-sm text-slate-400">
      Aucun DAB trouvé dans cette zone.
    </p>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {dabs.map((dab) => <DABCard key={dab.id} dab={dab} onSelect={onSelectDAB} onHighlight={onHighlightDAB} />)}
    </div>
  );
}
