import SignalementButton from './SignalementButton';
import useIsMobile from '../../hooks/useIsMobile';

export default function SignalementModal({ dab, onClose, onSuccess }) {
  const isMobile = useIsMobile();
  if (!dab) return null;

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 2000,
      }} onClick={onClose}>
        <div style={{
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '1.25rem 1.25rem 2rem',
          width: '100%',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
        }} onClick={(e) => e.stopPropagation()}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '4px', background: '#d1d5db', borderRadius: '2px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Signaler l'état</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1, padding: '0.25rem' }}>✕</button>
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>{dab.nom}</p>
          <SignalementButton dabId={dab.id} onSuccess={(data) => { onSuccess?.(data); onClose(); }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '0.75rem',
        padding: '1.5rem', maxWidth: '400px', width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Signaler l'état</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#374151' }}>{dab.nom}</p>
        <SignalementButton dabId={dab.id} onSuccess={(data) => { onSuccess?.(data); onClose(); }} />
      </div>
    </div>
  );
}
