import { useTranslation } from 'react-i18next';

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700">
      <span>⚠️</span>
      <span className="flex-1 text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="border border-red-300 rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
