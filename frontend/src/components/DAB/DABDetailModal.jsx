import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getDAB } from '../../api/dabApi';
import DABDetail from './DABDetail';
import Spinner from '../UI/Spinner';
import ErrorMessage from '../UI/ErrorMessage';
import { joinDABRoom, leaveDABRoom } from '../../hooks/useSocket';
import useIsMobile from '../../hooks/useIsMobile';

export default function DABDetailModal({ dabId, onClose }) {
  const [dab, setDab]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const isMobile              = useIsMobile();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getDAB(dabId)
      .then((res) => setDab(res.data))
      .catch(() => setError('DAB introuvable.'))
      .finally(() => setLoading(false));
  }, [dabId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    joinDABRoom(dabId);
    return () => leaveDABRoom(dabId);
  }, [dabId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSignalement = useCallback((data) => {
    if (data?.etatCommunautaire !== undefined) {
      setDab((prev) => prev ? { ...prev, etat_communautaire: data.etatCommunautaire } : prev);
    }
  }, []);

  const panelClass = isMobile
    ? 'bottom-0 left-0 right-0 h-[92dvh] rounded-t-2xl'
    : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,720px)] max-h-[88vh] rounded-xl';

  const modal = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] [-webkit-tap-highlight-color:transparent]"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dab?.nom || 'Détail DAB'}
        className={`fixed z-[2001] bg-white flex flex-col shadow-2xl overflow-hidden ${panelClass}`}
      >
        {/* Poignée visuelle mobile */}
        {isMobile && (
          <div
            onClick={onClose}
            className="flex-shrink-0 flex justify-center py-2.5 cursor-pointer"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0 min-h-[48px]">
          <span className="font-bold text-gray-900 text-base truncate mr-2">
            {loading ? 'Chargement…' : (dab?.nom || 'Détail DAB')}
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          {loading && (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          )}
          {error && (
            <div className="p-8">
              <ErrorMessage message={error} onRetry={load} />
            </div>
          )}
          {!loading && dab && (
            <DABDetail dab={dab} onSignalement={handleSignalement} />
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
