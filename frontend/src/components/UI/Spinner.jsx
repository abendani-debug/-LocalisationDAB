export default function Spinner({ size = 'md', label = 'Chargement…' }) {
  const sizes = { sm: '1rem', md: '2rem', lg: '3rem' };
  const s = sizes[size] || sizes.md;
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: s, height: s,
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
