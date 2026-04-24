import { useTranslation } from 'react-i18next';
import SignalementButton from './SignalementButton';

export default function SignalementModal({ dab, onClose, onSuccess }) {
  const { t } = useTranslation();
  if (!dab) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[2000] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8 sm:pb-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle mobile */}
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-start justify-between mb-1">
          <h3 className="m-0 text-base font-bold text-gray-900">{t('signalement.title')}</h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-slate-400 hover:text-gray-700 cursor-pointer text-xl leading-none p-1 -mt-1 -mr-1"
          >
            ✕
          </button>
        </div>

        <p className="m-0 mb-5 text-xs text-slate-400">
          {dab.nom} · {t('signalement.anonymous')}
        </p>

        <SignalementButton
          dabId={dab.id}
          onSuccess={(data) => { onSuccess?.(data); onClose(); }}
        />
      </div>
    </div>
  );
}
