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

  /* Fermeture clavier */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Verrouillage du scroll body */
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

  const modal = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dab?.nom || 'Détail DAB'}
        style={{
          position: 'fixed',
          zIndex: 2001,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          ...(isMobile ? {
            bottom: 0, left: 0, right: 0,
            height: '92dvh',
            borderRadius: '16px 16px 0 0',
          } : {
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(90vw, 720px)',
            maxHeight: '88vh',
            borderRadius: '12px',
          }),
        }}
      >
        {/* Poignée visuelle mobile */}
        {isMobile && (
          <div
            onClick={onClose}
            style={{
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              padding: '0.6rem 0 0.3rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db' }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0.5rem 1rem 0.6rem' : '0.75rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
          minHeight: 48,
        }}>
          <span style={{
            fontWeight: 700,
            fontSize: isMobile ? '1rem' : '1.05rem',
            color: '#111827',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: '0.5rem',
          }}>
            {loading ? 'Chargement…' : (dab?.nom || 'Détail DAB')}
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              flexShrink: 0,
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: 36, height: 36,
              cursor: 'pointer',
              fontSize: '1rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {loading && (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Spinner />
            </div>
          )}
          {error && (
            <div style={{ padding: '2rem' }}>
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
