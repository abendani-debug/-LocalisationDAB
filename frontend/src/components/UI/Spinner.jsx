import { useTranslation } from 'react-i18next';

const SIZES = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };

export default function Spinner({ size = 'md', label }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex flex-col items-center gap-2">
      <div className={`${SIZES[size] || SIZES.md} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
      <span className="text-sm text-slate-500">{label ?? t('common.loading')}</span>
    </div>
  );
}
