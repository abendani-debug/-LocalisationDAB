import { useState } from 'react';
import { submitSignalement } from '../../api/signalementApi';
import toast from 'react-hot-toast';

const ETATS = [
  { key: 'disponible', label: 'Disponible', emoji: '✅', border: 'hover:border-green-500',  active: 'border-green-500 bg-green-50' },
  { key: 'vide',       label: 'Vide',       emoji: '💸', border: 'hover:border-amber-500', active: 'border-amber-500 bg-amber-50' },
  { key: 'en_panne',   label: 'En panne',   emoji: '🔧', border: 'hover:border-red-500',   active: 'border-red-500   bg-red-50'   },
];

export default function SignalementButton({ dabId, onSuccess }) {
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSignal = async (etat) => {
    setSelected(etat);
    setLoading(true);
    try {
      const res = await submitSignalement(dabId, etat);
      toast.success('Signalement enregistré !');
      onSuccess?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du signalement.';
      toast.error(msg);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ETATS.map(({ key, label, emoji, border, active }) => (
          <button
            key={key}
            disabled={loading}
            onClick={() => handleSignal(key)}
            className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer bg-white font-[inherit]
              disabled:opacity-60 disabled:cursor-not-allowed
              ${selected === key ? active : `border-slate-200 ${border}`}`}
          >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-[11px] font-semibold text-gray-700">{label}</div>
          </button>
        ))}
      </div>
      <button
        disabled={!selected || loading}
        onClick={() => selected && handleSignal(selected)}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed font-[inherit]"
      >
        {loading ? 'Envoi…' : 'Envoyer le signalement'}
      </button>
    </div>
  );
}
