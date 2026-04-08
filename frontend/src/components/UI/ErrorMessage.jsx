export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" style={{
      background: '#fef2f2', border: '1px solid #fecaca',
      borderRadius: '0.5rem', padding: '0.75rem 1rem',
      color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem',
    }}>
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'none', border: '1px solid #dc2626',
          borderRadius: '0.25rem', padding: '0.25rem 0.5rem',
          color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem',
        }}>
          Réessayer
        </button>
      )}
    </div>
  );
}
