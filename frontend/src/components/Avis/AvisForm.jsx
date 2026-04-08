import { useState } from 'react';
import { createAvis } from '../../api/avisApi';
import toast from 'react-hot-toast';

export default function AvisForm({ dabId, onSuccess }) {
  const [note, setNote]           = useState(0);
  const [commentaire, setComment] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note < 1) { toast.error('Choisissez une note.'); return; }
    setLoading(true);
    try {
      await createAvis(dabId, { note, commentaire });
      toast.success('Avis publié !');
      setNote(0); setComment('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Laisser un avis</p>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
        {[1,2,3,4,5].map((n) => (
          <span key={n} onClick={() => setNote(n)} style={{ fontSize: '1.4rem', cursor: 'pointer', color: n <= note ? '#f59e0b' : '#d1d5db' }}>
            ★
          </span>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)"
        maxLength={1000}
        rows={3}
        style={{
          width: '100%', padding: '0.5rem', border: '1px solid #d1d5db',
          borderRadius: '0.375rem', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box',
        }}
      />
      <button type="submit" disabled={loading || note < 1} style={{
        marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#1e40af',
        color: '#fff', border: 'none', borderRadius: '0.375rem',
        cursor: loading || note < 1 ? 'not-allowed' : 'pointer', opacity: loading || note < 1 ? 0.7 : 1,
        fontSize: '0.85rem', fontWeight: 600,
      }}>
        {loading ? 'Publication…' : 'Publier'}
      </button>
    </form>
  );
}
