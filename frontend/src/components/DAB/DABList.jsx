import { useTranslation } from 'react-i18next';
import DABCard from './DABCard';
import Spinner from '../UI/Spinner';
import ErrorMessage from '../UI/ErrorMessage';

export default function DABList({ dabs, loading, error, onRetry, onSelectDAB, onHighlightDAB }) {
  const { t } = useTranslation();

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error)   return <div className="p-4"><ErrorMessage message={error} onRetry={onRetry} /></div>;
  if (!dabs.length) return (
    <div className="p-6 text-center flex flex-col gap-2">
      <p className="text-2xl">📍</p>
      <p className="text-sm font-medium text-slate-600">{t('dab.no_dabs_area')}</p>
      <p className="text-xs text-slate-400">{t('dab.expand_radius')}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {dabs.map((dab) => <DABCard key={dab.id} dab={dab} onSelect={onSelectDAB} onHighlight={onHighlightDAB} />)}
    </div>
  );
}
